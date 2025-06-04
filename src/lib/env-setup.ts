/**
 * Environment Setup Helper for Promptu
 * 
 * This file provides utilities to help set up your environment variables.
 * Run this to generate secure secrets and validate your configuration.
 */

import { randomBytes } from 'crypto';

export function generateAuthSecret(length: number = 32): string {
  return randomBytes(length).toString('base64');
}

export function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const ENV_SETUP_GUIDE = {
  required: {
    DATABASE_URL: {
      description: "PostgreSQL connection string",
      example: "postgresql://username:password@localhost:5432/promptu",
      setup: "Create a PostgreSQL database locally or use a service like Neon, Supabase, or Railway"
    },
    BETTER_AUTH_SECRET: {
      description: "Secret key for authentication (32+ characters)",
      example: generateAuthSecret(),
      setup: "Generate using: openssl rand -base64 32"
    },
    BETTER_AUTH_URL: {
      description: "Your application URL",
      example: "http://localhost:3000",
      setup: "Use localhost:3000 for development, your domain for production"
    },
    GOOGLE_CLIENT_ID: {
      description: "Google OAuth client ID",
      example: "1234567890-abcdefg.apps.googleusercontent.com", 
      setup: "Get from Google Cloud Console > APIs & Services > Credentials"
    },
    GOOGLE_CLIENT_SECRET: {
      description: "Google OAuth client secret",
      example: "GOCSPX-abcdefghijklmnop",
      setup: "Get from Google Cloud Console > APIs & Services > Credentials"
    },
    GITHUB_CLIENT_ID: {
      description: "GitHub OAuth app client ID",
      example: "Iv1.abcdefghijklmnop",
      setup: "Get from GitHub > Settings > Developer settings > OAuth Apps"
    },
    GITHUB_CLIENT_SECRET: {
      description: "GitHub OAuth app client secret", 
      example: "abcdefghijklmnopqrstuvwxyz1234567890",
      setup: "Get from GitHub > Settings > Developer settings > OAuth Apps"
    },
    NEXT_PUBLIC_APP_URL: {
      description: "Public app URL for client-side usage",
      example: "http://localhost:3000",
      setup: "Same as BETTER_AUTH_URL"
    }
  },
  optional: {
    DISCORD_FEEDBACK_WEBHOOK_URL: "Discord webhook for feedback notifications",
    DISCORD_FEATURE_WEBHOOK_URL: "Discord webhook for feature request notifications", 
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: "Google Analytics measurement ID",
    NEXT_PUBLIC_POSTHOG_KEY: "PostHog analytics key",
    RESEND_API_KEY: "Resend email service API key",
    SENTRY_DSN: "Sentry error monitoring DSN"
  }
};

export function printSetupGuide() {
  console.log('\n🚀 Promptu Environment Setup Guide\n');
  
  console.log('📋 Required Environment Variables:\n');
  Object.entries(ENV_SETUP_GUIDE.required).forEach(([key, config]) => {
    console.log(`${key}:`);
    console.log(`  Description: ${config.description}`);
    console.log(`  Example: ${config.example}`);
    console.log(`  Setup: ${config.setup}\n`);
  });
  
  console.log('🔧 Optional Environment Variables:\n');
  Object.entries(ENV_SETUP_GUIDE.optional).forEach(([key, description]) => {
    console.log(`${key}: ${description}`);
  });
  
  console.log('\n💡 Quick Setup:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Replace placeholder values with real credentials');
  console.log('3. Run: pnpm dev\n');
} 