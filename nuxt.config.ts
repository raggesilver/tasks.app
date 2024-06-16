// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    https: true,
  },
  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/main.css"],
  modules: [
    "shadcn-nuxt",
    "@unocss/nuxt",
    "nuxt-auth-utils",
    "nuxt-icon",
    "@vueuse/nuxt",
    "@hebilicious/vue-query-nuxt",
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
});
