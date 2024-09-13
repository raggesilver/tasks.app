// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true, componentInspector: false },

  devServer: {
    https: true,
  },

  experimental: {
    buildCache: true,
  },

  runtimeConfig: {
    public: {
      sentry: {
        dsn: "",
        environment: "development",
      },
      posthogPublicKey: "",
      // This needs to be overridden to our current host so that nitro can
      // proxy the requests to PostHog
      posthogHost: "https://us.i.posthog.com",
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/sign-in", "/legal/privacy-policy", "/legal/tos"],
      ignore: ["/app", "/auth"],
      retryDelay: 0,
      concurrency: 4,
    },
  },

  routeRules: {
    "/ingest/static/**": { proxy: "https://us-assets.i.posthog.com/static/**" },
    "/ingest/**": { proxy: "https://us.i.posthog.com/**" },
  },

  css: ["@unocss/reset/tailwind.css", "~/assets/css/main.css"],

  modules: [
    "shadcn-nuxt",
    "@unocss/nuxt",
    "nuxt-auth-utils",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@hebilicious/vue-query-nuxt",
    "@nuxt/content",
    "@nuxt/image",
    "@pinia/nuxt",
  ],

  vueQuery: {
    // vueQueryPluginOptions: {
    //   enableDevtoolsV6Plugin: true,
    // },
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
