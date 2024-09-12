import { browserTracingIntegration, init } from "@sentry/vue";

export default defineNuxtPlugin((nuxt) => {
  const router = useRouter();
  const {
    public: { sentry },
  } = useRuntimeConfig();

  if (!sentry.dsn) {
    return;
  }

  init({
    app: nuxt.vueApp,
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [
      browserTracingIntegration({ router }),
      // replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: import.meta.env.DEV ? 0.2 : 1.0,
    tracePropagationTargets: ["localhost", "tasksapp.fly.dev"],

    // replaysSessionSampleRate: 0,
    // replaysOnErrorSampleRate: 1,
  });
});
