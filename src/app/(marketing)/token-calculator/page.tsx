"use client";

import { useState, useEffect } from "react";
import { calculateTokens, formatTokenCount } from "@/lib/token-calculator";
import { Textarea } from "@/components/ui/textarea";
import type { TokenCalculationResult } from "@/lib/token-calculator";

export default function TokenCalculatorPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TokenCalculationResult>({
    tokens: 0,
    characters: 0,
    words: 0,
    method: 'estimated'
  });

  useEffect(() => {
    const calculationResult = calculateTokens(text);
    setResult(calculationResult);
  }, [text]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Token Calculator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Calculate tokens, words, and characters for AI prompts and content.
            </p>
          </div>

          {/* Calculator */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {/* Text Input */}
                <div>
                  <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your text or prompt
                  </label>
                  <Textarea
                    id="text-input"
                    placeholder="Type or paste your text here to calculate tokens..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-lg font-semibold text-gray-900">
                      {result.words.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-lg font-semibold text-gray-900">
                      {result.characters.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Characters</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-100 rounded-md border border-gray-300">
                    <div className="text-lg font-semibold text-gray-900">
                      {result.tokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-700 font-medium">Tokens</div>
                  </div>
                </div>

                {/* Additional Info */}
                {result.tokens > 0 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    Method: {result.method.replace('-', ' ')} • 
                    Formatted: {formatTokenCount(result.tokens)} tokens
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">How Token Calculation Works</h3>
            <div className="space-y-1 text-xs text-gray-700">
              <p>• Tokens are the basic units that language models process</p>
              <p>• 1 token ≈ 4 characters for English text on average</p>
              <p>• 1 token ≈ 0.75 words for typical English content</p>
              <p>• Our calculator uses both character and word-based methods for accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 