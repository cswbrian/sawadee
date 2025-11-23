/**
 * Google Analytics utility functions
 * 
 * To use:
 * 1. Set VITE_GA_MEASUREMENT_ID in your .env file (e.g., G-XXXXXXXXXX)
 * 2. Call initGA() in your app initialization
 * 3. Use trackEvent() or useAnalytics() hook for tracking
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
 * Initialize Google Analytics
 * Call this once when your app starts
 * Works with PWA/service workers by ensuring GA requests bypass cache
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics: VITE_GA_MEASUREMENT_ID not set');
    return;
  }

  // Initialize dataLayer and gtag function first (before script loads)
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Configure GA immediately (will queue until script loads)
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });

  // Load gtag.js script asynchronously
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  // Ensure GA requests bypass service worker cache
  script.setAttribute('data-gtag-id', GA_MEASUREMENT_ID);
  document.head.appendChild(script);
}

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
 * Check if GA is initialized
 */
export function isGAInitialized(): boolean {
  return typeof window.gtag === 'function' && !!GA_MEASUREMENT_ID;
}

