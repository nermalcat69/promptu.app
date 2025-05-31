import { PromptSubmissionForm } from "@/components/prompt-submission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Users, Star } from "lucide-react";

export default function SubmitPromptPage() {
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

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptSubmissionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 