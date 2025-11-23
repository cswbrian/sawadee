/**
 * Google Analytics utility functions
 * 
 * Google Analytics is initialized via HTML script tags injected by Vite plugin.
 * Set VITE_GA_MEASUREMENT_ID in your .env file (e.g., G-XXXXXXXXXX)
 * 
 * Use trackEvent() or useAnalytics() hook for tracking custom events.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Track a page view
 */
export function trackPageView(path: string) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', eventName, eventParams);
}

/**
 * Check if GA gtag is available
 */
export function isGAInitialized(): boolean {
  return typeof window.gtag === 'function';
}

