"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, CheckCircle, RefreshCw, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    website: "",
  });
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  // Auto-generate username when moving to step 2
  useEffect(() => {
    if (step === 2 && session?.user && !formData.username) {
      generateUsername();
    }
  }, [step, session, formData.username]);

  const generateUsername = async () => {
    if (!session?.user) return;

    setIsGeneratingUsername(true);
    try {
      const response = await fetch("/api/user/generate-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "single",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.username) {
          setFormData(prev => ({ ...prev, username: data.username }));
          toast.success("Username generated automatically!");
        }
      }
    } catch (error) {
      console.error("Error generating username:", error);
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const generateUsernameSuggestions = async () => {
    if (!session?.user) return;

    setIsGeneratingUsername(true);
    try {
      const response = await fetch("/api/user/generate-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "suggestions",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsernameSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error generating username suggestions:", error);
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const selectSuggestedUsername = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
    setShowSuggestions(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
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
          name: session?.user.name,
          username: formData.username,
          bio: formData.bio || null,
          website: formData.website || null,
        }),
      });

      if (response.ok) {
        toast.success("Profile setup complete!");
        setStep(3);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to setup profile");
      }
    } catch (error) {
      toast.error("Failed to setup profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Promptu!
          </h1>
          <p className="text-gray-600">
            Let's set up your profile to get started
          </p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Setup
              </CardTitle>
              <CardDescription>
                Tell us a bit about yourself to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="text-xl">
                      {session.user.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-gray-600">
                    Your profile picture is synced from your OAuth provider
                  </p>
                </div>

                {/* Name Display */}
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={session.user.name || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your display name from your OAuth provider
                  </p>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Username</CardTitle>
              <CardDescription>
                We've suggested a username based on your profile, but you can customize it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Section */}
                <div className="space-y-3">
                  <Label htmlFor="username">Username *</Label>
                  
                  {/* Auto-generated username display */}
                  {formData.username && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Great! We found the perfect username for you:
                          </p>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 mt-1">
                            @{formData.username}
                          </Badge>
                        </div>
                        <Sparkles className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  )}

                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value.toLowerCase())}
                    placeholder={isGeneratingUsername ? "Generating..." : "Enter username"}
                    disabled={isGeneratingUsername}
                    required
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateUsername}
                      disabled={isGeneratingUsername}
                      className="flex-1"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingUsername ? 'animate-spin' : ''}`} />
                      Generate New
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateUsernameSuggestions}
                      disabled={isGeneratingUsername}
                      className="flex-1"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      More Options
                    </Button>
                  </div>

                  {/* Username suggestions */}
                  {showSuggestions && usernameSuggestions.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">Choose from suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {usernameSuggestions.map((suggestion) => (
                          <Button
                            key={suggestion}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => selectSuggestedUsername(suggestion)}
                            className="text-xs bg-white hover:bg-blue-100 border-blue-300"
                          >
                            @{suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Your profile will be at: /profile/{formData.username || 'username'}
                  </p>
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

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="Enter your website URL"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !formData.username || isGeneratingUsername}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Profile Setup Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                Welcome to Promptu! You'll be redirected to your dashboard shortly.
              </p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-gray-900' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-gray-900' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-gray-900' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
} 