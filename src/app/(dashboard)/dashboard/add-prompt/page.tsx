"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";

export default function AddPromptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    promptType: "",
    category: "",
    content: ""
  });

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const autoSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, formData.slug]);

  // Check slug availability when slug changes
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!formData.slug || formData.slug.length < 3) {
        setSlugAvailable(null);
        return;
      }

      setIsCheckingSlug(true);
      try {
        const response = await fetch(`/api/prompts/check-slug?slug=${encodeURIComponent(formData.slug)}`);
        const data = await response.json();
        setSlugAvailable(data.available);
      } catch (error) {
        console.error("Error checking slug:", error);
        setSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    const timeoutId = setTimeout(checkSlugAvailability, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.promptType || !formData.content || !formData.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    if (formData.slug.length < 3) {
      toast.error("Slug must be at least 3 characters long");
      return;
    }

    // Check if slug is available
    if (slugAvailable === false) {
      toast.error("Please choose a different slug as this one is already taken");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.description,
          content: formData.content,
          promptType: formData.promptType,
          categoryId: null, // You can implement category selection later
          slug: formData.slug,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Prompt created successfully!");
        router.push(`/prompts/${result.prompt.slug}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create prompt");
      }
    } catch (error) {
      toast.error("Failed to create prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      title: value,
      // Only auto-generate slug if user hasn't manually edited it
      slug: prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(value) : prev.slug
    }));
  };

  const handleSlugChange = (value: string) => {
    // Clean the slug: lowercase, replace spaces with hyphens, remove invalid chars
    const cleanSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 py-8">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Add New Prompt
              </h1>
              <p className="text-gray-600 text-sm">
                Create a new AI prompt to share with the community
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter a descriptive title for your prompt"
                  className="h-12"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="relative">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="url-friendly-slug"
                    className={`h-12 font-mono text-sm pr-10 ${
                      slugAvailable === false ? 'border-red-300 focus:border-red-500' : 
                      slugAvailable === true ? 'border-green-300 focus:border-green-500' : ''
                    }`}
                    required
                  />
                  {isCheckingSlug && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    </div>
                  )}
                  {!isCheckingSlug && slugAvailable === true && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {!isCheckingSlug && slugAvailable === false && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      This will be used in the URL. Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                    {slugAvailable === false && (
                      <p className="text-xs text-red-600">
                        This slug is already taken. Please choose a different one.
                      </p>
                    )}
                    {slugAvailable === true && (
                      <p className="text-xs text-green-600">
                        This slug is available!
                      </p>
                    )}
                  </div>
                  {formData.slug && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <ExternalLink className="h-3 w-3" />
                      <span>/prompts/{formData.slug}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Briefly describe what this prompt does and when to use it"
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* Prompt Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promptType">Prompt Type *</Label>
                  <Select onValueChange={(value) => handleInputChange("promptType", value)} required>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select prompt type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prompt Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Prompt Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Enter your complete prompt here..."
                  className="min-h-[300px] font-mono text-sm"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={isSubmitting || isCheckingSlug || slugAvailable === false}
                >
                  {isSubmitting ? "Publishing..." : "Publish Prompt"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 