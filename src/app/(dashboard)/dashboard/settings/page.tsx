"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Camera } from "lucide-react";

export default function SettingsPage() {
  const { data: session, isPending, error } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    website: "",
    image: ""
  });

  // Debug session state
  useEffect(() => {
    console.log("Settings page session state:", { session, isPending, error });
  }, [session, isPending, error]);

  // Set up session timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isPending && !session && !error) {
        console.log("Session timeout reached, stopping loading");
        setSessionTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isPending, session, error]);

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        username: "", // Will be loaded from API
        bio: "", // Will be loaded from API
        website: "", // Will be loaded from API
        image: session.user.image || ""
      });
      // Load additional user data
      loadUserProfile();
    }
  }, [session]);

  // Handle session errors
  useEffect(() => {
    if (error) {
      console.error("Session error in settings:", error);
      toast.error("Authentication error. Please sign in again.");
    }
  }, [error]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setFormData(prev => ({
          ...prev,
          username: userData.username || "",
          bio: userData.bio || "",
          website: userData.website || ""
        }));
      } else {
        console.error("Failed to load user profile:", response.status);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (formData.username && formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    // Check if username contains only valid characters
    if (formData.username && !/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username || null,
          bio: formData.bio || null,
          website: formData.website || null,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading state while session is pending
  if (isPending && !sessionTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
          <p className="text-xs text-gray-400 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Show error state if session failed or timed out
  if (error || !session || sessionTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {sessionTimeout ? "Loading Timeout" : "Authentication Required"}
          </h2>
          <p className="text-gray-600 mb-4">
            {sessionTimeout 
              ? "Session is taking too long to load. Please try signing in again."
              : "Please sign in to access your settings."
            }
          </p>
          <Button onClick={() => window.location.href = '/sign-in'} className="bg-gray-900 hover:bg-gray-800 text-white">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your account settings and public profile
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Picture</CardTitle>
                <CardDescription>
                  Your profile picture is synced from your OAuth provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.image} alt={formData.name} />
                    <AvatarFallback className="text-lg">
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Profile pictures are managed through your connected OAuth provider (Google/GitHub)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and public profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your display name"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This is the name that will be displayed on your prompts
                    </p>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value.toLowerCase())}
                      placeholder="Choose a unique username"
                    />
                    <p className="text-xs text-gray-500">
                      Used for your public profile page. Letters, numbers, hyphens and underscores only.
                      {formData.username && (
                        <span className="block mt-1 text-blue-600">
                          Your profile will be at: /profile/{formData.username}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.bio.length}/500 characters. This will be shown on your public profile.
                    </p>
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="Enter your website URL"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.website && (
                        <span className="block mt-1 text-blue-600">
                          Your website is: {formData.website}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>
                Your account details and sign-in information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-sm text-gray-900">{session.user.email}</p>
                  <p className="text-xs text-gray-500">Managed by your OAuth provider</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Account Created</Label>
                  <p className="text-sm text-gray-900">
                    {new Date().toLocaleDateString()} {/* This would be from the user data */}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 