"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Copy, 
  Share2, 
  Calendar,
  CheckCircle,
  ExternalLink 
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

interface PromptDetailProps {
  promptId: string;
}

interface PromptData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  promptType: string;
  upvotes: number;
  views: number;
  featured: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  commentsCount: number;
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

export function PromptDetail({ promptId }: PromptDetailProps) {
  const [prompt, setPrompt] = useState<PromptData | null>(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchPrompt();
    if (session) {
      checkUpvoteStatus();
    }
  }, [promptId, session]);

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`);
      if (response.ok) {
        const data = await response.json();
        setPrompt(data.prompt);
        setUpvoteCount(data.prompt.upvotes);
      } else {
        toast.error("Prompt not found");
      }
    } catch (error) {
      toast.error("Failed to load prompt");
    } finally {
      setIsLoading(false);
    }
  };

  const checkUpvoteStatus = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/upvote`);
      if (response.ok) {
        const data = await response.json();
        setIsUpvoted(data.upvoted);
      }
    } catch (error) {
      console.error("Failed to check upvote status:", error);
    }
  };

  const handleUpvote = async () => {
    if (!session) {
      toast.error("Please sign in to upvote");
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${promptId}/upvote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsUpvoted(data.upvoted);
        setUpvoteCount(prev => data.upvoted ? prev + 1 : prev - 1);
        toast.success(data.message);
      } else {
        toast.error("Failed to upvote");
      }
    } catch (error) {
      toast.error("Failed to upvote");
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setIsCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt?.title,
          text: prompt?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to share");
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prompt) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Prompt not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  className={`text-sm ${getPromptTypeColor(prompt.promptType)}`}
                >
                  {prompt.promptType}
                </Badge>
                {prompt.category && (
                  <Badge variant="outline">
                    <Link href={`/categories/${prompt.category.slug}`}>
                      {prompt.category.name}
                    </Link>
                  </Badge>
                )}
                {prompt.featured && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {prompt.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-4">
                {prompt.excerpt}
              </p>
              
              {/* Author and Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={prompt.author.image || ""} alt={prompt.author.name} />
                    <AvatarFallback>
                      {prompt.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Link 
                    href={`/users/${prompt.author.id}`}
                    className="font-medium text-gray-900 hover:text-gray-700"
                  >
                    {prompt.author.name}
                  </Link>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-1 text-gray-500">
              <Heart className="h-4 w-4" />
              <span>{upvoteCount}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{prompt.views}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>{prompt.commentsCount}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={handleUpvote}
              variant={isUpvoted ? "default" : "outline"}
              size="sm"
              className={isUpvoted ? "bg-red-500 hover:bg-red-600 text-white" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isUpvoted ? "fill-current" : ""}`} />
              {isUpvoted ? "Upvoted" : "Upvote"}
            </Button>
            
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isCopied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? "Copied!" : "Copy"}
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          {/* Prompt Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Prompt Content</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800">
                {prompt.content}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 