"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Globe, AtSign } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    website: ""
  });

  // Set up session timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!session && !isPending) {
        setSessionTimeout(true);
        toast.error("Session expired. Redirecting to homepage...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [session, isPending, router]);

  // Handle session errors
  useEffect(() => {
    if (error) {
      console.error("Session error:", error);
      toast.error("Authentication error. Redirecting to homepage...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [error, router]);

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || ""
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("No active session. Please sign in again.");
      router.push("/sign-in");
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    // Check if username contains only valid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    // Validate website URL if provided
    if (formData.website && formData.website.trim()) {
      try {
        const url = formData.website.startsWith('http') ? formData.website : `https://${formData.website}`;
        new URL(url);
      } catch {
        toast.error("Please enter a valid website URL");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
        }),
      });

      if (response.ok) {
        toast.success("Profile completed successfully!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to complete profile");
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      toast.error("Failed to complete profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading state while checking session
  if (isPending && !sessionTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if session failed or timed out
  if (sessionTimeout || error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Error</h2>
          <p className="text-gray-600 mb-4">
            {sessionTimeout ? "Session timed out." : "Unable to load your session."} 
            Redirecting to homepage...
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Let's set up your profile to get started with Promptu
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value.toLowerCase())}
                    placeholder="choose-username"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This will be your unique identifier. Letters, numbers, hyphens and underscores only.
                </p>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="your-website.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[80px]"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {formData.bio.length}/200 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Completing Profile..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-4">
          You can always update this information later in your settings.
        </p>
      </div>
    </div>
  );
} 