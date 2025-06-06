"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface UpvoteButtonProps {
  promptSlug: string;
  initialUpvotes: number;
  className?: string;
}

export function UpvoteButton({ promptSlug, initialUpvotes, className }: UpvoteButtonProps) {
  const { data: session } = useSession();
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [loading, setLoading] = useState(false);

  // Check if user has upvoted this prompt
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/prompts/${promptSlug}/upvote`)
        .then(res => res.json())
        .then(data => {
          if (data.upvoted !== undefined) {
            setUpvoted(data.upvoted);
          }
        })
        .catch(console.error);
    }
  }, [promptSlug, session]);

  const handleUpvote = async () => {
    if (!session?.user) {
      // Redirect to sign in
      window.location.href = '/sign-in';
      return;
    }

    if (loading) return;

    setLoading(true);
    
    try {
      const response = await fetch(`/api/prompts/${promptSlug}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpvoted(data.upvoted);
        // Update local count optimistically
        setUpvotes(prev => data.upvoted ? prev + 1 : prev - 1);
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
    <div className="flex items-center gap-1">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleUpvote}
        disabled={loading}
        className={`h-7 w-8 p-0 cursor-pointer border transition-all duration-200 ${
          upvoted 
            ? 'border-green-500 bg-green-50 text-green-700' 
            : 'border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700'
        } ${className || ''}`}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
        {upvotes || 0}
      </span>
    </div>
  );
} 