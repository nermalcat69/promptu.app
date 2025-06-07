"use client";

import React from "react";
import Link from "next/link";
import { Plus, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile";

export function MarketingNavButtons() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/sign-in" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      </Button>
      <Button size="sm" className="bg-black text-white hover:bg-gray-800" asChild>
        <Link href="/sign-up">
          <span>Sign Up</span>
        </Link>
      </Button>
    </div>
  );
}

export function DashboardNavButtons() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/create" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
      </Button>
    </div>
  );
} 