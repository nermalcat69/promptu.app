"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Star, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  const trendingPrompts = [
    { id: "1", title: "ChatGPT Jailbreak Prompt", upvotes: 234 },
    { id: "2", title: "Resume Builder Assistant", upvotes: 189 },
    { id: "3", title: "Code Debugger Pro", upvotes: 156 },
    { id: "4", title: "Social Media Manager", upvotes: 142 },
    { id: "5", title: "Email Marketing Copy", upvotes: 128 }
  ];

  const categories = [
    { name: "Marketing", count: 156, slug: "marketing" },
    { name: "Coding", count: 142, slug: "coding" },
    { name: "Writing", count: 128, slug: "writing" },
    { name: "Business", count: 98, slug: "business" },
    { name: "Creative", count: 87, slug: "creative" },
    { name: "Analysis", count: 76, slug: "analysis" },
    { name: "Education", count: 65, slug: "education" },
    { name: "Research", count: 54, slug: "research" }
  ];

  return (
    <div className="space-y-6">
      {/* Trending Prompts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-7 w-7" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingPrompts.map((prompt, index) => (
            <div key={prompt.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/prompts/${prompt.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 line-clamp-2"
                >
                  {prompt.title}
                </Link>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{prompt.upvotes} upvotes</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Popular Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Advertisement Section */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Advertise with Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Reach thousands of AI enthusiasts and developers. Promote your AI tools, courses, or services to our engaged community.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>10K+ monthly visitors</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>High engagement rates</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Targeted AI audience</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              <Mail className="h-4 w-4 mr-2" />
              <a href="mailto:ads@promptu.app">Contact Us</a>
            </Button>
            
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              <Link href="/advertise">Learn More</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Community Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Prompts</span>
            <span className="font-semibold text-gray-900">2,847</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Users</span>
            <span className="font-semibold text-gray-900">12,456</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">This Week</span>
            <span className="font-semibold text-green-600">+234 prompts</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 