// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true, componentInspector: true },

  devServer: {
    https: true,
  },

  routeRules: {
    "/legal/**": {
      prerender: true,
    },
    "/": {
      prerender: true,
    },
    "/app/**": {
      ssr: true,
      prerender: false,
    },
  },

  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/main.css"],

  modules: [
    "shadcn-nuxt",
    "@unocss/nuxt",
    "nuxt-auth-utils",
    "nuxt-icon",
    "@vueuse/nuxt",
    "@hebilicious/vue-query-nuxt",
    "@nuxt/content",
    "@nuxt/image",
  ],

  vueQuery: {
    queryClientOptions: {
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
        },
      },
    },
  },

  compatibilityDate: "2024-07-09",
});