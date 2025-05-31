"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4" />
              <span>Discover, Share & Find AI Prompts</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Ultimate
            <br />
            <span className="text-gray-600">AI Prompt Marketplace</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find high-quality system prompts, user prompts, and developer prompts for all your AI needs. 
            Join our community of prompt creators and discover prompts that actually work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-3">
              <Link href="/prompts" className="flex items-center gap-2">
                Browse Prompts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="px-8 py-3">
              <Link href="/signin">
                Share Your Prompts
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">System Prompts</h3>
                <p className="text-gray-600 text-sm">
                  Foundational instructions that set AI behavior and context
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">User Prompts</h3>
                <p className="text-gray-600 text-sm">
                  Specific inputs and questions for immediate AI responses
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Developer Prompts</h3>
                <p className="text-gray-600 text-sm">
                  Technical prompts for fine-tuning and application development
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 