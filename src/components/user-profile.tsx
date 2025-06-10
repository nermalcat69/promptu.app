"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation";
import Link from "next/link"
import { toast } from "sonner"
import { 
  LogOutIcon, 
  User, 
  Plus, 
  FileText, 
  LayoutDashboard,
  Settings,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils";

export function UserProfile({ className }: { className?: string }) {
  const [signingOut, setSigningOut] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Fetch username when session is available
  useEffect(() => {
    if (session?.user) {
      fetchUsername();
    }
  }, [session]);

  const fetchUsername = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setUsername(userData.username);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  if (isPending) {
    return (
      <div className="h-9 w-9 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-muted/50 animate-pulse"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("h-9 w-9 p-0", signingOut && "animate-pulse", className)}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
            <AvatarFallback className="bg-gray-100">
              {session.user.image ? (
                session.user.name?.charAt(0) || "U"
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]" align="end">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="font-medium leading-none">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              {username && (
                <p className="text-xs text-blue-600">@{username}</p>
              )}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
              <AvatarFallback className="bg-gray-100">
                {session.user.image ? (
                  session.user.name?.charAt(0) || "U"
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        
        {username && (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href={`/profile/${username}`} className="flex items-center gap-2">
              <ExternalLink className="size-4" />
              <span>View Public Profile</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/dashboard/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            <span>Create Prompt</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="cursor-pointer w-full flex items-center justify-between gap-2 text-red-600 focus:text-red-600"
          onClick={() => signOut({
            fetchOptions: {
              onRequest: () => {
                setSigningOut(true);
                toast.loading("Signing out...");
              },
              onSuccess: () => {
                setSigningOut(false);
                toast.success("Signed out successfully");
                toast.dismiss();
                router.push("/");
              },
              onError: () => {
                setSigningOut(false);
                toast.error("Failed to sign out");
              },
            }
          })}
        >
          <span>Sign Out</span>
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
