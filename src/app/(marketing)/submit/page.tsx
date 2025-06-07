"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Users, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SubmitPromptPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard create prompt
    if (session) {
      router.push("/dashboard?create=true");
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected via useEffect
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Share Your AI Prompt
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help the community by sharing your best AI prompts. Whether it's for system instructions, 
            user interactions, or developer tools, your contribution matters.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Knowledge</h3>
              <p className="text-sm text-gray-600">
                Help others discover effective prompts and improve their AI interactions
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Community</h3>
              <p className="text-sm text-gray-600">
                Connect with other AI enthusiasts and grow your reputation
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Recognition</h3>
              <p className="text-sm text-gray-600">
                Earn upvotes and recognition for your valuable contributions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sign In Call to Action */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl">Ready to Submit Your Prompt?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You need to be signed in to submit prompts. Join our community to start sharing your AI prompts!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/sign-in">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">
                  Create Account
                </Link>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Already have an account? You'll be redirected to the dashboard automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 