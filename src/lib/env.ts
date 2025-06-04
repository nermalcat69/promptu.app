import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),

  // Optional environment variables
  DISCORD_FEEDBACK_WEBHOOK_URL: z.string().optional(),
  DISCORD_FEATURE_WEBHOOK_URL: z.string().optional(),
  
  // Analytics (optional but recommended for production)
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  
  // Error monitoring (optional but recommended for production)
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Email service (optional)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // App configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(err => `❌ ${err.path.join('.')}: ${err.message}`).join('\n');
      
      console.error('\n🚨 Environment Configuration Error:\n');
      console.error(missing);
      console.error('\n📋 Please check your .env file and ensure all required variables are set.');
      console.error('💡 Copy .env.example to .env and fill in the values.\n');
      
      process.exit(1);
    }
    throw error;
  }
}

// Export the validated environment variables
export const env = validateEnv();

// Helper to generate a secure auth secret
export function generateAuthSecret(): string {
  if (typeof window !== 'undefined') {
    throw new Error('generateAuthSecret should only be called on the server');
  }
  
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

// Utility to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development'; 