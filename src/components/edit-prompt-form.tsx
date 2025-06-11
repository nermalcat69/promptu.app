"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { validatePromptContent, formatValidationErrorMessage } from "@/lib/validations/prompt-validation";

interface PromptData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  promptType: string;
  categoryId: string | null;
  published: boolean | null;
}

interface Category {
  id: string;
  name: string;
}

interface EditPromptFormProps {
  promptData: PromptData;
  categories: Category[];
}

export function EditPromptForm({ promptData, categories }: EditPromptFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: promptData.title,
    excerpt: promptData.excerpt,
    content: promptData.content,
    promptType: promptData.promptType,
    categoryId: promptData.categoryId || "",
    published: promptData.published ?? false,
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(false);

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
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${promptData.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          promptType: formData.promptType,
          categoryId: formData.categoryId || null,
          published: formData.published,
        }),
      });

      if (response.ok) {
        toast.success("Prompt updated successfully!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update prompt");
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast.error("Failed to update prompt");
    } finally {
      setIsLoading(false);
    }
  };

  const getPromptTypeColor = (type: string) => {
    switch (type) {
      case "system":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "user":
        return "bg-green-50 text-green-700 border-green-200";
      case "developer":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-base font-medium">
          Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., Professional Email Writer"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value });
            // Clear validation error when user starts typing
            if (validationErrors.title) {
              setValidationErrors(prev => ({ ...prev, title: '' }));
            }
          }}
          className={`mt-1 ${validationErrors.title ? 'border-red-500' : ''}`}
          required
        />
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-500">
            Clear, descriptive title that explains what your prompt does
          </p>
          <span className="text-xs text-gray-500">
            {formData.title.length} chars
          </span>
        </div>
        {validationErrors.title && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{validationErrors.title}</p>
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt" className="text-base font-medium">
          Short Description *
        </Label>
        <Textarea
          id="excerpt"
          placeholder="Brief description of what this prompt accomplishes..."
          value={formData.excerpt}
          onChange={(e) => {
            setFormData({ ...formData, excerpt: e.target.value });
            // Clear validation error when user starts typing
            if (validationErrors.excerpt) {
              setValidationErrors(prev => ({ ...prev, excerpt: '' }));
            }
          }}
          className={`mt-1 min-h-[100px] ${validationErrors.excerpt ? 'border-red-500' : ''}`}
          required
        />
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-500">
            This will appear in the prompt listing and search results
          </p>
          <span className="text-xs text-gray-500">
            {formData.excerpt.length} chars
          </span>
        </div>
        {validationErrors.excerpt && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{validationErrors.excerpt}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="content" className="text-base font-medium">
            Prompt Content *
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
        
        {!showPreview ? (
          <Textarea
            id="content"
            placeholder="Enter your AI prompt here..."
            value={formData.content}
            onChange={(e) => {
              setFormData({ ...formData, content: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.content) {
                setValidationErrors(prev => ({ ...prev, content: '' }));
              }
            }}
            className={`mt-1 min-h-[200px] font-mono text-sm ${validationErrors.content ? 'border-red-500' : ''}`}
            required
          />
        ) : (
          <Card className="mt-1">
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                {formData.content || "No content to preview"}
              </pre>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-500">
            The actual prompt text that users will copy and use
          </p>
          <span className="text-xs text-gray-500">
            {formData.content.length} chars
          </span>
        </div>
        {validationErrors.content && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{validationErrors.content}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prompt Type */}
        <div>
          <Label htmlFor="promptType" className="text-base font-medium">
            Prompt Type *
          </Label>
          <Select 
            value={formData.promptType} 
            onValueChange={(value) => {
              setFormData({ ...formData, promptType: value });
              // Clear validation error when user selects
              if (validationErrors.promptType) {
                setValidationErrors(prev => ({ ...prev, promptType: '' }));
              }
            }}
          >
            <SelectTrigger className={`mt-1 ${validationErrors.promptType ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select prompt type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    System
                  </Badge>
                  <span>System prompts (instructions)</span>
                </div>
              </SelectItem>
              <SelectItem value="user">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    User
                  </Badge>
                  <span>User prompts (requests)</span>
                </div>
              </SelectItem>
              <SelectItem value="developer">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Developer
                  </Badge>
                  <span>Developer prompts (technical)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Choose the type that best describes your prompt
          </p>
          {validationErrors.promptType && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-500">{validationErrors.promptType}</p>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-base font-medium">
            Category
          </Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Help users find your prompt by selecting a relevant category
          </p>
        </div>
      </div>

      <Separator />

      {/* Publishing Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="published" className="text-base font-medium">
              Publish Prompt
            </Label>
            <p className="text-sm text-gray-500">
              Make this prompt visible to other users
            </p>
          </div>
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
          />
        </div>

        {formData.published && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">This prompt will be public</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your prompt will be visible to all users and may appear in search results and the browse page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          {isLoading ? "Updating..." : "Update Prompt"}
        </Button>
      </div>
    </form>
  );
} 