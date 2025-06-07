"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VotingButtonsProps {
  promptSlug: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCounts?: boolean;
  upvoteOnly?: boolean;
}

interface VotingState {
  upvoted: boolean;
  downvoted: boolean;
  upvoteCount: number;
  downvoteCount: number;
  netScore: number;
}

export function VotingButtons({ 
  promptSlug, 
  className,
  size = "md",
  showCounts = true,
  upvoteOnly = false
}: VotingButtonsProps) {
  const [voting, setVoting] = useState<VotingState>({
    upvoted: false,
    downvoted: false,
    upvoteCount: 0,
    downvoteCount: 0,
    netScore: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial voting state
  useEffect(() => {
    const fetchVotingState = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptSlug}/vote`);
        if (response.ok) {
          const data = await response.json();
          setVoting({
            upvoted: data.upvoted || false,
            downvoted: data.downvoted || false,
            upvoteCount: data.upvoteCount || 0,
            downvoteCount: data.downvoteCount || 0,
            netScore: data.netScore || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching voting state:", error);
      }
    };

    fetchVotingState();
  }, [promptSlug]);

  const handleVote = async (type: "upvote" | "downvote") => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts/${promptSlug}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const data = await response.json();
        setVoting({
          upvoted: data.upvoted || false,
          downvoted: data.downvoted || false,
          upvoteCount: data.upvoteCount || 0,
          downvoteCount: data.downvoteCount || 0,
          netScore: data.netScore || 0,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to vote");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = () => handleVote("upvote");

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // If upvoteOnly mode, return a simplified upvote button
  if (upvoteOnly) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "transition-all duration-200 border rounded-md",
            sizeClasses[size],
            voting.upvoted
              ? "bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-md"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
          )}
          onClick={handleUpvote}
          disabled={loading}
          title={voting.upvoted ? "Remove upvote" : "Upvote this prompt"}
        >
          <ChevronUp size={iconSizes[size]} />
        </Button>

        {/* Show count only if there are upvotes and showCounts is true */}
        {showCounts && voting.upvoteCount > 0 && (
          <span className="text-sm font-medium text-gray-700 min-w-[1.5rem]">
            {voting.upvoteCount}
          </span>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-xs text-red-600 mt-1">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "p-1 transition-colors",
          sizeClasses[size],
          voting.upvoted
            ? "text-green-600 bg-green-50 hover:bg-green-100"
            : "text-gray-500 hover:text-green-600 hover:bg-green-50"
        )}
        onClick={() => handleVote("upvote")}
        disabled={loading}
        title={voting.upvoted ? "Remove upvote" : "Upvote this prompt"}
      >
        <ChevronUp size={iconSizes[size]} />
      </Button>

      {/* Vote Count Display */}
      {showCounts && (
        <div className="flex flex-col items-center text-xs font-medium">
          <span
            className={cn(
              "transition-colors",
              voting.netScore > 0
                ? "text-green-600"
                : voting.netScore < 0
                ? "text-red-600"
                : "text-gray-600"
            )}
          >
            {voting.netScore > 0 ? `+${voting.netScore}` : voting.netScore}
          </span>
          {size !== "sm" && (
            <div className="text-xs text-gray-400 mt-1">
              <span className="text-green-600">{voting.upvoteCount}</span>
              {" / "}
              <span className="text-red-600">{voting.downvoteCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "p-1 transition-colors",
          sizeClasses[size],
          voting.downvoted
            ? "text-red-600 bg-red-50 hover:bg-red-100"
            : "text-gray-500 hover:text-red-600 hover:bg-red-50"
        )}
        onClick={() => handleVote("downvote")}
        disabled={loading}
        title={voting.downvoted ? "Remove downvote" : "Downvote this prompt"}
      >
        <ChevronDown size={iconSizes[size]} />
      </Button>

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-600 mt-1 text-center max-w-20">
          {error}
        </div>
      )}
    </div>
  );
} 