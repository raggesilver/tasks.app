import * as Sentry from "@sentry/vue";

export default defineNuxtPlugin((nuxt) => {
  const router = useRouter();
  const {
    public: { sentry },
  } = useRuntimeConfig();

  if (!sentry.dsn) {
    return;
  }

  Sentry.init({
    app: nuxt.vueApp,
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: import.meta.env.DEV ? 0 : 0.6,
    tracePropagationTargets: ["localhost", "tasksapp.fly.dev"],

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.DEV ? 0 : 1,
  });
});
