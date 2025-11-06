import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

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
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
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
        theme_color: "#EFEAE3", // Main background color from your theme
        background_color: "#EFEAE3", // Light background color
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