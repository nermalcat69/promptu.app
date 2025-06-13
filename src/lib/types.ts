// Shared types for the application

export interface Author {
  id: string;
  name: string;
  image?: string | null;
  username?: string | null;
}

export interface CursorRuleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  ruleType: string;
  globs?: string | null;
  category?: string;
  author?: Author | null;
  upvotes?: number | null;
  views?: number | null;
  copyCount?: number | null;
  featured?: boolean | null;
  published?: boolean | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  tokens?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PromptData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  promptType: string;
  category?: string;
  author?: Author | null;
  upvotes?: number | null;
  views?: number | null;
  copyCount?: number | null;
  featured?: boolean | null;
  published?: boolean | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  tokens?: number;
} 