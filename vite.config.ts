import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import type { Plugin } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// Plugin to inject Google Analytics script tags
function googleAnalyticsPlugin(): Plugin {
  return {
    name: "google-analytics",
    transformIndexHtml(html) {
      const gaId = process.env.VITE_GA_MEASUREMENT_ID
      if (!gaId) {
        return html
      }

      const gaScripts = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>`

      // Insert before closing </head> tag
      return html.replace("</head>", `${gaScripts}\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Use relative base path to work with both GitHub Pages URL and custom domain
  // This allows the app to work at both:
  // - https://cswbrian.github.io/sawadee/ (GitHub Pages)
  // - https://sawadee.monsoonclub.co/ (custom domain)
  const basePath = process.env.VITE_BASE_PATH || (command === "build" ? "./" : "/")
  
  return {
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    googleAnalyticsPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Exclude Google Analytics from caching to ensure accurate tracking
        navigateFallbackDenylist: [/^\/_/, /^\/api/, /\/__/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Explicitly bypass cache for Google Analytics requests
          {
            urlPattern: /^https:\/\/(www\.)?(googletagmanager\.com|google-analytics\.com)\/.*/i,
            handler: "NetworkOnly",
            options: {
              cacheName: "ga-bypass",
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Sawadee - Learn Thai",
        short_name: "Sawadee",
        description: "A modern web application for learning Thai language",
        // Theme colors matching your app's design
        theme_color: "#fdf4c8", // Main background color from your theme
        background_color: "#fdf4c8", // Light background color
        display: "standalone", // Options: "standalone" | "fullscreen" | "minimal-ui" | "browser"
        orientation: "portrait", // Options: "portrait" | "landscape" | "any" | "natural"
        scope: command === "build" ? "./" : "/",
        start_url: command === "build" ? "./" : "/",
        // Additional PWA options
        categories: ["education", "learning"], // App categories
        lang: "en", // Language
        dir: "ltr", // Text direction
        prefer_related_applications: false, // Don't prefer native apps
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  }
})