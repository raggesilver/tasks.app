// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/main.css"],
  nitro: {
    preset: "bun",
  },
  modules: [
    "shadcn-nuxt",
    "@unocss/nuxt",
    "nuxt-auth-utils",
    "nuxt-icon",
    "@vueuse/nuxt",
  ],
});