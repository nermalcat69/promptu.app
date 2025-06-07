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
  const { data: session, isPending } = useSession();
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [loading, setLoading] = useState(false);

  // Check if user has upvoted this prompt
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/prompts/${promptSlug}/vote`)
        .then(res => res.json())
        .then(data => {
          if (data.upvoted !== undefined) {
            setUpvoted(data.upvoted);
            setUpvotes(data.upvoteCount || initialUpvotes);
          }
        })
        .catch(console.error);
    }
  }, [promptSlug, session, initialUpvotes]);

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
      const response = await fetch(`/api/prompts/${promptSlug}/vote`, {
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
    <div className="flex items-center gap-1">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleUpvote}
        disabled={loading || isPending}
        className={`h-7 w-8 p-0 cursor-pointer border transition-all duration-200 ${
          upvoted 
            ? 'border-green-500 bg-green-50 text-green-700' 
            : 'border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700'
        } ${className || ''}`}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
        {upvotes || 0} {(upvotes || 0) === 1 ? 'upvote' : 'upvotes'}
      </span>
    </div>
  );
} 