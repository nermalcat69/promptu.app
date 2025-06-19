"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface UpvoteButtonProps {
  promptSlug: string;
  initialUpvotes: number;
  className?: string;
  contentType?: "prompt" | "cursor-rule";
}

export function UpvoteButton({ promptSlug, initialUpvotes, className, contentType = "prompt" }: UpvoteButtonProps) {
  const { data: session, isPending } = useSession();
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [loading, setLoading] = useState(false);

  // Check if user has upvoted this content
  useEffect(() => {
    if (session?.user) {
      const apiPath = contentType === "cursor-rule" ? "cursor-rules" : "prompts";
      fetch(`/api/${apiPath}/${promptSlug}/vote`)
        .then(res => res.json())
        .then(data => {
          if (data.upvoted !== undefined) {
            setUpvoted(data.upvoted);
            setUpvotes(data.upvoteCount || initialUpvotes);
          }
        })
        .catch(console.error);
    }
  }, [promptSlug, session, initialUpvotes, contentType]);

  const handleUpvote = async () => {
    // If session is still loading, prevent action
    if (isPending) {
      return;
    }
    
    // Check authentication BEFORE doing anything
    if (!session?.user) {
      // Redirect to sign up immediately - no API call needed
      window.location.href = '/signup';
      return;
    }

    // Only proceed with API call if user is authenticated
    if (loading) return;

    setLoading(true);
    
    try {
      const apiPath = contentType === "cursor-rule" ? "cursor-rules" : "prompts";
      const response = await fetch(`/api/${apiPath}/${promptSlug}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'upvote' }),
      });

      if (response.ok) {
        const data = await response.json();
        setUpvoted(data.upvoted);
        setUpvotes(data.upvoteCount);
      } else {
        const error = await response.json();
        console.error('Upvote error:', error.error);
      }
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleUpvote}
      disabled={loading || isPending}
      className={`h-7 px-2 cursor-pointer border transition-all duration-200 flex items-center gap-1 ${
        upvoted 
          ? 'border-green-700 bg-green-600 text-white hover:bg-green-700 shadow-md' 
          : 'border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700'
      } ${className || ''}`}
    >
      <ChevronUp className="h-4 w-4" />
      <span className="text-sm font-medium">
        {upvotes || 0}
      </span>
    </Button>
  );
} 