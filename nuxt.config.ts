// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-09-24",
  devtools: { enabled: true, componentInspector: false },

  future: {
    compatibilityVersion: 4,
  },

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
    aws: {
      accessKeyId: "",
      endpointUrlS3: "",
      region: "auto",
      secretAccessKey: "",
      signing: {
        privateKey: "",
        publicKey: "",
        /**
         * This needs to be generated with CreatePublicKeyCommand. The
         * credentials used to generate this key must have admin privileges.
         */
        publicKeyId: "",
      },
    },
    bucketName: "",
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/sign-in", "/legal/privacy-policy", "/legal/tos"],
      ignore: ["/app", "/auth"],
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "class-variance-authority",
        "@radix-icons/vue",
        "clsx",
        "tailwind-merge",
        "@tanstack/vue-query",
        "vaul-vue",
        "@vee-validate/zod",
        "zod",
        "radix-vue",
      ],
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
    "@vueuse/motion/nuxt",
    "@hebilicious/vue-query-nuxt",
    "@nuxt/content",
    "@nuxt/image",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
  ],

  content: {
    sources: {
      content: {
        driver: "fs",
        base: "./app/content",
      },
    },
  },

  shadcn: {
    componentDir: "./app/components/ui",
  },

  vueQuery: {
    vueQueryPluginOptions: {
      enableDevtoolsV6Plugin: true,
    },
    queryClientOptions: {
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
        },
      },
    },
  },
});
