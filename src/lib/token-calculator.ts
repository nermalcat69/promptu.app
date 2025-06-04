/**
 * Token calculation service for AI prompts
 * Based on OpenAI's tokenization rules:
 * - 1 token ≈ 4 characters for English text
 * - 1 token ≈ 0.75 words for English text
 * - Common sequences are grouped into single tokens
 * - First token of each word typically starts with a space
 */

export interface TokenCalculationResult {
  tokens: number;
  characters: number;
  words: number;
  method: 'character-based' | 'word-based' | 'estimated';
}

/**
 * Calculate tokens for a given text using multiple methods for accuracy
 */
export function calculateTokens(text: string): TokenCalculationResult {
  if (!text || text.trim().length === 0) {
    return {
      tokens: 0,
      characters: 0,
      words: 0,
      method: 'estimated'
    };
  }

  const cleanText = text.trim();
  const characters = cleanText.length;
  const words = cleanText.split(/\s+/).filter(word => word.length > 0).length;

  // Use character-based calculation as primary method (1 token ≈ 4 characters)
  const charBasedTokens = Math.ceil(characters / 4);
  
  // Use word-based calculation as secondary method (1 token ≈ 0.75 words)
  const wordBasedTokens = Math.ceil(words / 0.75);

  // Take the average of both methods for better accuracy
  // Favor character-based for shorter text, word-based for longer text
  let finalTokens: number;
  let method: 'character-based' | 'word-based' | 'estimated';

  if (words < 10) {
    // For short text, character-based is more accurate
    finalTokens = charBasedTokens;
    method = 'character-based';
  } else if (Math.abs(charBasedTokens - wordBasedTokens) < 50) {
    // If methods are close, average them
    finalTokens = Math.round((charBasedTokens + wordBasedTokens) / 2);
    method = 'estimated';
  } else {
    // For longer text, word-based tends to be more accurate
    finalTokens = wordBasedTokens;
    method = 'word-based';
  }

  return {
    tokens: finalTokens,
    characters,
    words,
    method
  };
}

/**
 * Calculate tokens for prompt content including title and excerpt
 */
export function calculatePromptTokens(title: string, excerpt: string, content: string): TokenCalculationResult {
  const combinedText = `${title}\n\n${excerpt}\n\n${content}`;
  return calculateTokens(combinedText);
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return tokens.toString();
  } else if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  } else {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
}

/**
 * Estimate cost based on token count (for different AI models)
 */
export function estimateTokenCost(tokens: number, model: 'gpt-4' | 'gpt-3.5' | 'claude' = 'gpt-4'): number {
  const rates = {
    'gpt-4': 0.03 / 1000,      // $0.03 per 1K tokens
    'gpt-3.5': 0.002 / 1000,   // $0.002 per 1K tokens  
    'claude': 0.008 / 1000     // $0.008 per 1K tokens (estimated)
  };
  
  return tokens * rates[model];
} 