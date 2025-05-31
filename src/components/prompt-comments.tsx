"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Reply, Send } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

interface PromptCommentsProps {
  promptId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  replies?: Comment[];
  promptId?: string;
}

function CommentItem({ 
  comment, 
  promptId, 
  onReply 
}: { 
  comment: Comment; 
  promptId: string;
  onReply: (parentId: string) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
          <AvatarFallback>
            {comment.author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              href={`/users/${comment.author.id}`}
              className="font-medium text-gray-900 hover:text-gray-700"
            >
              {comment.author.name}
            </Link>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs h-auto p-1"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
          
          {showReplyForm && (
            <CommentForm
              promptId={promptId}
              parentId={comment.id}
              onSuccess={() => {
                setShowReplyForm(false);
                onReply(comment.id);
              }}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              compact
            />
          )}
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-4 pl-4 border-l-2 border-gray-100">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              promptId={promptId}
              onReply={onReply} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  promptId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Write a comment...",
  compact = false
}: {
  promptId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        setContent("");
        toast.success("Comment added successfully!");
        onSuccess();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to join the conversation</p>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        {!compact && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>
              {session.user.name?.split(' ').map(n => n[0]).join('') || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={compact ? "text-sm" : "min-h-[100px]"}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className={`flex gap-2 ${compact ? "" : "ml-11"}`}>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function PromptComments({ promptId }: PromptCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [promptId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setTotal(data.total);
      }
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSuccess = () => {
    fetchComments();
  };

  const handleReply = (parentId: string) => {
    fetchComments();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({total})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <CommentForm
          promptId={promptId}
          onSuccess={handleCommentSuccess}
        />
        
        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                promptId={promptId}
                onReply={handleReply}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 