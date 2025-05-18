// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/color-mode",
    "@vite-pwa/nuxt",
  ],
  ssr: false,
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Client Deadline Tracker",
      short_name: "CDT PWA",
      description: "A Client Deadline Tracker PWA App",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
        {
          src: "/client-deadline-tracker-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/client-deadline-tracker-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,jpg,svg,json}"],
    },
  },
  css: ["~/assets/css/main.css"],
  colorMode: {
    classSuffix: "",
    preference: "light",
    fallback: "light",
  },
  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || "http://localhost:8000",
    },
  },
});
