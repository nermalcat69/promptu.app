"use client";

import React from "react";
import Link from "next/link";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile";
import { useSession } from "@/lib/auth-client";

export function MarketingNavButtons() {
  const { data: session, isPending } = useSession();
  
  return (
    <>
      {!isPending && (session ? (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/submit" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Post Prompt</span>
            </Link>
          </Button>
          <UserProfile className="size-9" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/signin" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          </Button>
          <Button size="sm" className="bg-black text-white hover:bg-gray-800" asChild>
            <Link href="/signup">
              <span>Get Started</span>
            </Link>
          </Button>
        </div>
      ))}
    </>
  );
}

export function DashboardNavButtons() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" asChild>
        <Link href="/submit" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Post Prompt</span>
        </Link>
      </Button>
      <UserProfile className="size-9" />
    </div>
  );
} 