"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Eye, MessageCircle, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const mockPrompts = [
  {
    id: "1",
    title: "Professional Email Writer",
    excerpt: "A comprehensive system prompt for writing professional emails with proper tone, structure, and etiquette. Perfect for business communications.",
    content: "You are a professional email writing assistant...",
    promptType: "system",
    category: "Business",
    author: {
      name: "Sarah Chen",
      image: "/avatars/sarah.jpg",
      username: "sarahc"
    },
    upvotes: 142,
    views: 1205,
    comments: 23,
    featured: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Code Review Assistant",
    excerpt: "Detailed prompt for conducting thorough code reviews with focus on best practices, security, and performance optimization.",
    content: "As a senior software engineer, review the following code...",
    promptType: "developer",
    category: "Coding",
    author: {
      name: "Alex Rodriguez",
      image: "/avatars/alex.jpg",
      username: "alexr"
    },
    upvotes: 89,
    views: 756,
    comments: 15,
    featured: false,
    createdAt: "2024-01-14"
  },
  {
    id: "3",
    title: "Creative Story Generator",
    excerpt: "Generate engaging short stories with compelling characters, plot twists, and vivid descriptions. Great for writers and content creators.",
    content: "Write a creative short story that includes...",
    promptType: "user",
    category: "Creative",
    author: {
      name: "Maya Patel",
      image: "/avatars/maya.jpg",
      username: "mayap"
    },
    upvotes: 67,
    views: 432,
    comments: 8,
    featured: false,
    createdAt: "2024-01-13"
  },
  {
    id: "4",
    title: "Marketing Copy Optimizer",
    excerpt: "Transform basic product descriptions into compelling marketing copy that converts. Includes A/B testing suggestions.",
    content: "Optimize the following marketing copy for better conversion...",
    promptType: "system",
    category: "Marketing",
    author: {
      name: "David Kim",
      image: "/avatars/david.jpg",
      username: "davidk"
    },
    upvotes: 156,
    views: 1890,
    comments: 31,
    featured: true,
    createdAt: "2024-01-12"
  },
  {
    id: "5",
    title: "Data Analysis Helper",
    excerpt: "Comprehensive prompt for analyzing datasets, identifying patterns, and generating actionable insights with statistical backing.",
    content: "Analyze the following dataset and provide insights...",
    promptType: "user",
    category: "Analysis",
    author: {
      name: "Emma Wilson",
      image: "/avatars/emma.jpg",
      username: "emmaw"
    },
    upvotes: 94,
    views: 623,
    comments: 12,
    featured: false,
    createdAt: "2024-01-11"
  },
  {
    id: "6",
    title: "API Documentation Generator",
    excerpt: "Generate comprehensive API documentation with examples, error codes, and best practices. Perfect for developer teams.",
    content: "Create detailed API documentation for the following endpoints...",
    promptType: "developer",
    category: "Coding",
    author: {
      name: "James Thompson",
      image: "/avatars/james.jpg",
      username: "jamest"
    },
    upvotes: 78,
    views: 445,
    comments: 9,
    featured: false,
    createdAt: "2024-01-10"
  }
];

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

export function PromptGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockPrompts.map((prompt) => (
        <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-200 border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${getPromptTypeColor(prompt.promptType)}`}
                  >
                    {prompt.promptType}
                  </Badge>
                  {prompt.featured && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                      Featured
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                  <Link href={`/prompts/${prompt.id}`}>
                    {prompt.title}
                  </Link>
                </h3>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-4">
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {prompt.excerpt}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={prompt.author.image} alt={prompt.author.name} />
                <AvatarFallback className="text-xs">
                  {prompt.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{prompt.author.name}</span>
              <span className="text-xs text-gray-400">•</span>
              <Badge variant="outline" className="text-xs">
                {prompt.category}
              </Badge>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{prompt.upvotes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{prompt.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{prompt.comments}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link href={`/prompts/${prompt.id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 