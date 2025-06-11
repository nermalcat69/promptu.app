import { CursorRuleSubmissionForm } from "@/components/cursor-rule-submission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateCursorRulePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Terminal className="h-4 w-4 text-purple-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Create New Cursor Rule
            </h1>
          </div>
          <p className="text-gray-600">
            Share your Cursor configuration rule with the community. Fill out the details below to publish your rule.
          </p>
        </div>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cursor Rule Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CursorRuleSubmissionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 