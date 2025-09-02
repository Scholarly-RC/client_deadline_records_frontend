// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxtjs/color-mode", "@vite-pwa/nuxt", "@nuxt/ui", "nuxt-echarts"],
  ssr: false,
  typescript: {
    typeCheck: true,
    strict: true
  },
  
  // ECharts configuration for dashboard charts
  echarts: {
    renderer: ['canvas', 'svg'],
    charts: [
      'LineChart',
      'BarChart', 
      'PieChart',
      'GaugeChart',
      'HeatmapChart',
      'ScatterChart'
    ],
    components: [
      'DatasetComponent',
      'GridComponent',
      'TooltipComponent',
      'LegendComponent',
      'DataZoomComponent',
      'MarkLineComponent',
      'MarkPointComponent',
      'TitleComponent',
      'ToolboxComponent',
      'BrushComponent'
    ],
    features: [
      'LabelLayout',
      'UniversalTransition'
    ]
  },
  
  // Route redirects for backward compatibility
  nitro: {
    routeRules: {
      '/deadlines': { redirect: '/tasks' },
      '/deadlines/**': { redirect: '/tasks/**' },
      '/my-deadlines': { redirect: '/my-tasks' },
      '/my-deadlines/**': { redirect: '/my-tasks/**' }
    }
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Client Task Tracker",
      short_name: "CTT PWA",
      description: "A Client Task Tracker PWA App",
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
      navigateFallback: "/",
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 60,
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
