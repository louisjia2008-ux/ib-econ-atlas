import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/ib-econ-atlas/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      includeAssets: ["favicon.svg", "pwa-icon.svg"],
      manifest: {
        id: "/ib-econ-atlas/",
        name: "IB Econ Atlas",
        short_name: "Econ Atlas",
        description: "Bilingual IB Economics study, search and spaced-review workspace.",
        theme_color: "#07142d",
        background_color: "#eef2f7",
        display: "standalone",
        orientation: "any",
        scope: "/ib-econ-atlas/",
        start_url: "/ib-econ-atlas/#/study/u1-04-scarcity",
        lang: "zh-CN",
        categories: ["education", "productivity"],
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,svg,json,webmanifest}"],
        navigateFallbackDenylist: [/\/api\//, /\/ask(?:\/|$)/],
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
});
