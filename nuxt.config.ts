// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true, componentInspector: true },

  devServer: {
    https: true,
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

  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/main.css"],

  modules: [
    "shadcn-nuxt",
    "@unocss/nuxt",
    "nuxt-auth-utils",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@hebilicious/vue-query-nuxt",
    "@nuxt/content",
    "@nuxt/image",
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
