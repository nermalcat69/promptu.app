import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lightbulb, Target, Zap, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PromptGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            📚 Educational Guide
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            The Complete Prompt Engineering Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the art of writing effective AI prompts. Learn proven techniques, best practices, and advanced strategies to get better results from AI models.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Be Specific
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Clear, detailed instructions yield better results than vague requests.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                Provide Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Give the AI background information to understand your needs better.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Iterate & Refine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Test different approaches and refine your prompts based on results.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Fundamentals */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Prompt Engineering Fundamentals</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">1. Structure Your Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    A well-structured prompt typically includes:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Role/Context:</strong> Define who the AI should act as</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Task:</strong> Clearly state what you want done</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Format:</strong> Specify the desired output format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Constraints:</strong> Add any limitations or requirements</span>
                    </li>
                  </ul>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-900 mb-2">Example:</p>
                    <code className="text-sm text-gray-700 block">
                      "You are a professional copywriter. Write a compelling product description for a wireless headphone. Format it as a short paragraph with bullet points for key features. Keep it under 100 words and focus on benefits for remote workers."
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">2. Use Clear and Specific Language</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-2">❌ Vague:</p>
                      <code className="text-sm text-red-700">"Write something about marketing"</code>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2">✅ Specific:</p>
                      <code className="text-sm text-green-700">"Write a 5-step email marketing strategy for a SaaS startup targeting small businesses"</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">3. Provide Examples (Few-Shot Learning)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Show the AI what you want by providing examples:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <code className="text-sm text-gray-700 block whitespace-pre-line">
{`Convert these features into benefits:

Feature: 256GB storage
Benefit: Store thousands of photos and apps without worry

Feature: 12-hour battery life
Benefit: Work all day without searching for a charger

Now convert this feature:
Feature: Waterproof design`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Advanced Techniques */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Techniques</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chain of Thought</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Ask the AI to show its reasoning process:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-sm text-gray-700">
                      "Solve this step by step, showing your work..."
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role Playing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Have the AI adopt a specific persona:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-sm text-gray-700">
                      "Act as a senior software engineer reviewing this code..."
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temperature Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Guide creativity vs. consistency:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-sm text-gray-700">
                      "Be creative and think outside the box..." or "Be precise and factual..."
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Constraint Setting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Set clear boundaries:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-sm text-gray-700">
                      "Limit response to 50 words, use simple language..."
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Best Practices Checklist */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices Checklist</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-3">✅ Do:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Be specific about desired output format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Provide context and background information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Use examples to clarify expectations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Break complex tasks into steps</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Test and iterate your prompts</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-3">❌ Don't:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">×</span>
                        <span>Use vague or ambiguous language</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">×</span>
                        <span>Assume the AI knows your context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">×</span>
                        <span>Make prompts unnecessarily complex</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">×</span>
                        <span>Forget to specify output constraints</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">×</span>
                        <span>Give up after the first attempt</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-8 pb-8">
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Create Amazing Prompts?
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Put your new knowledge to work! Browse our community prompts for inspiration or submit your own creations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/prompts" className="flex items-center gap-2">
                      Browse Prompts
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/submit">
                      Submit Your Prompt
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
} 