"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

// Google Analytics configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

// Google Analytics functions
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  gtag('event', eventName, parameters);
};

export const trackPageView = (url: string) => {
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track user registration
export const trackRegistration = (userId: string, username: string) => {
  trackEvent('sign_up', {
    method: 'oauth',
    user_id: userId,
    username: username,
  });
};

// Track prompt creation
export const trackPromptCreation = (promptId: string, promptType: string) => {
  trackEvent('create_prompt', {
    prompt_id: promptId,
    prompt_type: promptType,
  });
};

// Track prompt view
export const trackPromptView = (promptId: string, promptTitle: string) => {
  trackEvent('view_item', {
    item_id: promptId,
    item_name: promptTitle,
    item_category: 'prompt',
  });
};

// Track prompt copy
export const trackPromptCopy = (promptId: string, promptTitle: string) => {
  trackEvent('select_content', {
    content_type: 'prompt',
    item_id: promptId,
    item_name: promptTitle,
  });
};

// Page tracking component that needs search params
function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      const url = pathname + searchParams.toString();
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

// Google Analytics Script Component
export function GoogleAnalytics() {
  // Don't render if GA ID is not provided
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
    </>
  );
}

// Analytics Provider Component
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  );
} 