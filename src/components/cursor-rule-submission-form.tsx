"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Save, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  validateCursorRuleContent, 
  getFieldCharacterCount, 
  formatValidationErrorMessage,
  CURSOR_RULE_VALIDATION_RULES 
} from "@/lib/validations/cursor-rule-validation";

export function CursorRuleSubmissionForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    ruleType: "",
    globs: "",
    category: "",
    slug: "",
    tags: [] as string[],
  });

  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const ruleTypes = [
    { value: "always", label: "Always", description: "Applied to every AI execution within the project" },
    { value: "auto-attached", label: "Auto-attached", description: "Triggered when working on files matching specific patterns" },
    { value: "agent-requested", label: "Agent-requested", description: "Suggested by the AI when it detects relevant context" },
    { value: "manual", label: "Manual", description: "Activated only when explicitly referenced in chat" },
  ];

  const categories = [
    "Frontend", "Backend", "Database", "DevOps", "Testing", "Documentation", 
    "Code Style", "Architecture", "Performance", "Security"
  ];

  // Function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug when title changes
  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
    // Clear validation error when user starts typing
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const validateForm = () => {
    const validation = validateCursorRuleContent({
      title: formData.title,
      description: formData.description,
      content: formData.content,
      globs: formData.globs,
    });

    const errors: {[key: string]: string} = {};
    validation.errors.forEach(error => {
      errors[error.field] = formatValidationErrorMessage(error);
    });

    // Additional required field validation
    if (!formData.ruleType) {
      errors.ruleType = "Please select a rule type";
    }

    if (!formData.slug) {
      errors.slug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    } else if (formData.slug.length < 3) {
      errors.slug = "Slug must be at least 3 characters long";
    }

    setValidationErrors(errors);
    return validation.isValid && !errors.ruleType && !errors.slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/cursor-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          ruleType: formData.ruleType,
          globs: formData.globs || null,
          category: formData.category || null,
          slug: formData.slug,
          tags: formData.tags,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Cursor rule published successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          content: "",
          ruleType: "",
          globs: "",
          category: "",
          slug: "",
          tags: [],
        });
        // Redirect to the new cursor rule
        window.location.href = `/cursor-rules/${data.cursorRule.slug}`;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to publish cursor rule");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/cursor-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          ruleType: formData.ruleType,
          globs: formData.globs || null,
          category: formData.category || null,
          slug: formData.slug,
          tags: formData.tags,
          published: false, // Save as draft
        }),
      });

      if (response.ok) {
        toast.success("Draft saved successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save draft");
      }
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base font-medium">
            Rule Title *
          </Label>
          <Input
            id="title"
            placeholder="e.g., TypeScript Strict Mode Configuration"
            value={formData.title}
            onChange={(e) => {
              handleTitleChange(e.target.value);
            }}
            className={`mt-1 ${validationErrors.title ? 'border-red-500' : ''}`}
            maxLength={CURSOR_RULE_VALIDATION_RULES.title.maxLength}
            required
          />
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-gray-500">
              Choose a clear, descriptive title ({CURSOR_RULE_VALIDATION_RULES.title.minLength}-{CURSOR_RULE_VALIDATION_RULES.title.maxLength} characters)
            </p>
            <span className={`text-xs ${
              getFieldCharacterCount(formData.title, 'title').isValid ? 'text-gray-500' : 'text-red-500'
            }`}>
              {formData.title.trim().length}/{CURSOR_RULE_VALIDATION_RULES.title.maxLength}
            </span>
          </div>
          {validationErrors.title && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-500">{validationErrors.title}</p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="slug" className="text-base font-medium">
            URL Slug *
          </Label>
          <Input
            id="slug"
            placeholder="e.g., typescript-strict-mode"
            value={formData.slug}
            onChange={(e) => {
              setFormData({ ...formData, slug: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.slug) {
                setValidationErrors(prev => ({ ...prev, slug: '' }));
              }
            }}
            className={`mt-1 font-mono text-sm ${validationErrors.slug ? 'border-red-500' : ''}`}
            required
          />
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-gray-500">
              This will be your rule's URL: /cursor-rules/{formData.slug || 'your-slug'}
            </p>
            <span className="text-xs text-gray-500">
              {formData.slug.length} chars
            </span>
          </div>
          {validationErrors.slug && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-500">{validationErrors.slug}</p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            placeholder="A brief description of what this rule does and how it helps developers..."
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.description) {
                setValidationErrors(prev => ({ ...prev, description: '' }));
              }
            }}
            className={`mt-1 min-h-[80px] ${validationErrors.description ? 'border-red-500' : ''}`}
            maxLength={CURSOR_RULE_VALIDATION_RULES.description.maxLength}
            required
          />
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-gray-500">
              Minimum {CURSOR_RULE_VALIDATION_RULES.description.minLength} characters - This will be shown in the rule card
            </p>
            <span className={`text-xs ${
              getFieldCharacterCount(formData.description, 'description').isValid ? 'text-gray-500' : 'text-red-500'
            }`}>
              {formData.description.trim().length}/{CURSOR_RULE_VALIDATION_RULES.description.maxLength}
            </span>
          </div>
          {validationErrors.description && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Rule Type Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Rule Type *
        </Label>
        <RadioGroup
          value={formData.ruleType}
          onValueChange={(value) => {
            setFormData({ ...formData, ruleType: value });
            // Clear validation error when user selects
            if (validationErrors.ruleType) {
              setValidationErrors(prev => ({ ...prev, ruleType: '' }));
            }
          }}
          className="space-y-3"
        >
          {ruleTypes.map((type) => (
            <div key={type.value} className="flex items-start space-x-3">
              <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={type.value} className="font-medium cursor-pointer">
                  {type.label}
                </Label>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        {validationErrors.ruleType && (
          <div className="flex items-center gap-1 mt-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{validationErrors.ruleType}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* File Patterns and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="globs" className="text-base font-medium">
            File Patterns (Optional)
          </Label>
          <Input
            id="globs"
            placeholder="e.g., **/*.ts,**/*.tsx"
            value={formData.globs}
            onChange={(e) => {
              setFormData({ ...formData, globs: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.globs) {
                setValidationErrors(prev => ({ ...prev, globs: '' }));
              }
            }}
            className={`mt-1 font-mono text-sm ${validationErrors.globs ? 'border-red-500' : ''}`}
            maxLength={CURSOR_RULE_VALIDATION_RULES.globs.maxLength}
          />
          <p className="text-sm text-gray-500 mt-1">
            Comma-separated glob patterns for auto-attached rules
          </p>
          {validationErrors.globs && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-500">{validationErrors.globs}</p>
            </div>
          )}
        </div>

        <div>
          <Label className="text-base font-medium">
            Category (Optional)
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Rule Content */}
      <div>
        <Label htmlFor="content" className="text-base font-medium">
          Rule Content *
        </Label>
        <Textarea
          id="content"
          placeholder="Enter your complete cursor rule configuration here..."
          value={formData.content}
          onChange={(e) => {
            setFormData({ ...formData, content: e.target.value });
            // Clear validation error when user starts typing
            if (validationErrors.content) {
              setValidationErrors(prev => ({ ...prev, content: '' }));
            }
          }}
          className={`mt-1 min-h-[200px] font-mono text-sm ${validationErrors.content ? 'border-red-500' : ''}`}
          maxLength={CURSOR_RULE_VALIDATION_RULES.content.maxLength}
          required
        />
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-500">
            Minimum {CURSOR_RULE_VALIDATION_RULES.content.minLength} characters - Include usage instructions and examples
          </p>
          <span className={`text-xs ${
            getFieldCharacterCount(formData.content, 'content').isValid ? 'text-gray-500' : 'text-red-500'
          }`}>
            {formData.content.trim().length}/{CURSOR_RULE_VALIDATION_RULES.content.maxLength}
          </span>
        </div>
        {validationErrors.content && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{validationErrors.content}</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{formData.title || "Rule Title"}</h3>
              <p className="text-gray-600 mt-1">{formData.description || "Rule description will appear here..."}</p>
            </div>
            <div className="flex gap-2">
              {formData.ruleType && (
                <Badge variant="outline">
                  {ruleTypes.find(t => t.value === formData.ruleType)?.label}
                </Badge>
              )}
              {formData.globs && (
                <Badge variant="outline" className="text-xs">
                  Files: {formData.globs}
                </Badge>
              )}
              {formData.category && (
                <Badge variant="outline">{formData.category}</Badge>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {formData.content || "Rule content will appear here..."}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Eye className="h-4 w-4" />
          {preview ? "Hide Preview" : "Show Preview"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save as Draft"}
        </Button>
        
        <Button
          type="submit"
          className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
          disabled={isLoading}
        >
          <Send className="h-4 w-4" />
          {isLoading ? "Publishing..." : "Publish Rule"}
        </Button>
      </div>
    </form>
  );
} 