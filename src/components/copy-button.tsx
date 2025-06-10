"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  promptSlug?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  showText?: boolean;
  onCopy?: () => void;
}

export function CopyButton({ 
  text, 
  promptSlug,
  className,
  variant = "default",
  size = "default",
  children,
  showText = true,
  onCopy
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    // Prevent multiple simultaneous copy operations
    if (copied) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Reset button after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      // Increment copy count if promptSlug is provided
      if (promptSlug) {
        try {
          const response = await fetch(`/api/prompts/${promptSlug}/copy`, {
            method: 'POST',
          });
          
          if (response.ok) {
            // Call the callback to update UI immediately
            onCopy?.();
          }
        } catch (error) {
          console.error('Failed to increment copy count:', error);
        }
      } else {
        // If no promptSlug, still call onCopy for other uses
        onCopy?.();
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
      setCopied(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        copied && "bg-green-600 hover:bg-green-700 text-white",
        className
      )}
      onClick={handleCopy}
      disabled={copied}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      
      {showText && (
        <span className="ml-2">
          {children || (copied ? "Copied prompt" : "Copy")}
        </span>
      )}
    </Button>
  );
} 