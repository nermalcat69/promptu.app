"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import Link from "next/link";

interface RelatedPromptsProps {
  promptId: string;
}

interface RelatedPrompt {
  id: string;
  title: string;
  excerpt: string;
  promptType: string;
  upvotes: number;
  views: number;
  author: {
    name: string;
  };
}

function getPromptTypeColor(type: string) {
  switch (type) {
    case "system":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "user":
      return "bg-green-100 text-green-800 border-green-200";
    case "developer":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function RelatedPrompts({ promptId }: RelatedPromptsProps) {
  const [relatedPrompts, setRelatedPrompts] = useState<RelatedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRelatedPrompts();
  }, [promptId]);

  const fetchRelatedPrompts = async () => {
    try {
      // For now, we'll fetch recent prompts as "related"
      // In a real implementation, you'd want to fetch based on category/tags/type
      const response = await fetch(`/api/prompts?limit=5&sort=popular`);
      if (response.ok) {
        const data = await response.json();
        // Filter out the current prompt
        const filtered = data.prompts.filter((p: any) => p.id !== promptId).slice(0, 4);
        setRelatedPrompts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch related prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (relatedPrompts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedPrompts.map((prompt) => (
          <div key={prompt.id} className="group">
            <Link href={`/prompts/${prompt.id}`}>
              <div className="space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPromptTypeColor(prompt.promptType)}`}
                  >
                    {prompt.promptType}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-sm text-gray-900 group-hover:text-gray-700 line-clamp-2">
                  {prompt.title}
                </h4>
                
                <p className="text-xs text-gray-600 line-clamp-2">
                  {prompt.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>by {prompt.author.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{prompt.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{prompt.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 