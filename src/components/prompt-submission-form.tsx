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
  validatePromptContent, 
  getFieldCharacterCount, 
  formatValidationErrorMessage,
  PROMPT_VALIDATION_RULES 
} from "@/lib/validations/prompt-validation";

export function PromptSubmissionForm() {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    promptType: "",
    category: "",
    tags: [] as string[],
  });

  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const promptTypes = [
    { value: "system", label: "System Prompt", description: "Instructions that set AI behavior and context" },
    { value: "user", label: "User Prompt", description: "Specific inputs for immediate AI responses" },
    { value: "developer", label: "Developer Prompt", description: "Technical prompts for development and fine-tuning" },
  ];

  const categories = [
    "Marketing", "Coding", "Writing", "Business", "Creative", "Analysis", 
    "Education", "Research", "Customer Service", "Content Creation"
  ];

  const validateForm = () => {
    const validation = validatePromptContent({
      title: formData.title,
      description: formData.excerpt,
      content: formData.content,
    });

    const errors: {[key: string]: string} = {};
    validation.errors.forEach(error => {
      errors[error.field] = formatValidationErrorMessage(error);
    });

    // Additional required field validation
    if (!formData.promptType) {
      errors.promptType = "Please select a prompt type";
    }

    setValidationErrors(errors);
    return validation.isValid && !errors.promptType;
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
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          promptType: formData.promptType,
          categoryId: formData.category || null,
          tags: formData.tags,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Prompt published successfully!");
        // Reset form
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          promptType: "",
          category: "",
          tags: [],
        });
        // Redirect to the new prompt
        window.location.href = `/prompts/${data.prompt.id}`;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to publish prompt");
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
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          promptType: formData.promptType,
          categoryId: formData.category || null,
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
            Prompt Title *
          </Label>
          <Input
            id="title"
            placeholder="e.g., Professional Email Writer Assistant"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.title) {
                setValidationErrors(prev => ({ ...prev, title: '' }));
              }
            }}
            className={`mt-1 ${validationErrors.title ? 'border-red-500' : ''}`}
            maxLength={PROMPT_VALIDATION_RULES.title.maxLength}
            required
          />
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-gray-500">
              Choose a clear, descriptive title ({PROMPT_VALIDATION_RULES.title.minLength}-{PROMPT_VALIDATION_RULES.title.maxLength} characters)
            </p>
            <span className={`text-xs ${
              getFieldCharacterCount(formData.title, 'title').isValid ? 'text-gray-500' : 'text-red-500'
            }`}>
              {formData.title.trim().length}/{PROMPT_VALIDATION_RULES.title.maxLength}
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
          <Label htmlFor="excerpt" className="text-base font-medium">
            Short Description *
          </Label>
          <Textarea
            id="excerpt"
            placeholder="A brief description of what this prompt does and how it helps users..."
            value={formData.excerpt}
            onChange={(e) => {
              setFormData({ ...formData, excerpt: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.description) {
                setValidationErrors(prev => ({ ...prev, description: '' }));
              }
            }}
            className={`mt-1 min-h-[80px] ${validationErrors.description ? 'border-red-500' : ''}`}
            maxLength={PROMPT_VALIDATION_RULES.description.maxLength}
            required
          />
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-gray-500">
              Minimum {PROMPT_VALIDATION_RULES.description.minLength} characters - This will be shown in the prompt card
            </p>
            <span className={`text-xs ${
              getFieldCharacterCount(formData.excerpt, 'description').isValid ? 'text-gray-500' : 'text-red-500'
            }`}>
              {formData.excerpt.trim().length}/{PROMPT_VALIDATION_RULES.description.maxLength}
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

      {/* Prompt Type Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Prompt Type *
        </Label>
        <RadioGroup
          value={formData.promptType}
          onValueChange={(value) => {
            setFormData({ ...formData, promptType: value });
            // Clear validation error when user selects
            if (validationErrors.promptType) {
              setValidationErrors(prev => ({ ...prev, promptType: '' }));
            }
          }}
          className="space-y-3"
        >
          {promptTypes.map((type) => (
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
        {validationErrors.promptType && (
          <div className="flex items-center gap-1 mt-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{validationErrors.promptType}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Category and Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium">
            Category *
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

        <div>
          <Label className="text-base font-medium">
            Tags (Optional)
          </Label>
          <Input
            placeholder="e.g., email, professional, business"
            className="mt-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !formData.tags.includes(value)) {
                  setFormData({
                    ...formData,
                    tags: [...formData.tags, value]
                  });
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          <p className="text-sm text-gray-500 mt-1">
            Press Enter or comma to add tags
          </p>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      tags: formData.tags.filter((_, i) => i !== index)
                    });
                  }}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Prompt Content */}
      <div>
        <Label htmlFor="content" className="text-base font-medium">
          Prompt Content *
        </Label>
        <Textarea
          id="content"
          placeholder="Enter your complete prompt here. Be as detailed as possible to help others understand how to use it effectively..."
          value={formData.content}
          onChange={(e) => {
            setFormData({ ...formData, content: e.target.value });
            // Clear validation error when user starts typing
            if (validationErrors.content) {
              setValidationErrors(prev => ({ ...prev, content: '' }));
            }
          }}
          className={`mt-1 min-h-[200px] font-mono text-sm ${validationErrors.content ? 'border-red-500' : ''}`}
          maxLength={PROMPT_VALIDATION_RULES.content.maxLength}
          required
        />
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-500">
            Minimum {PROMPT_VALIDATION_RULES.content.minLength} characters - Include usage instructions and examples
          </p>
          <span className={`text-xs ${
            getFieldCharacterCount(formData.content, 'content').isValid ? 'text-gray-500' : 'text-red-500'
          }`}>
            {formData.content.trim().length}/{PROMPT_VALIDATION_RULES.content.maxLength}
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
              <h3 className="font-semibold text-lg">{formData.title || "Prompt Title"}</h3>
              <p className="text-gray-600 mt-1">{formData.excerpt || "Short description will appear here..."}</p>
            </div>
            <div className="flex gap-2">
              {formData.promptType && (
                <Badge variant="outline">
                  {promptTypes.find(t => t.value === formData.promptType)?.label}
                </Badge>
              )}
              {formData.category && (
                <Badge variant="outline">{formData.category}</Badge>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {formData.content || "Prompt content will appear here..."}
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
          {isLoading ? "Publishing..." : "Publish Prompt"}
        </Button>
      </div>
    </form>
  );
} 