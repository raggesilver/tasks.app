import * as Sentry from "@sentry/node";
import { H3Error } from "h3";

export default defineNitroPlugin((nitro) => {
  const {
    public: { sentry },
  } = useRuntimeConfig();

  if (!sentry.dsn) {
    console.warn("Sentry DSN is not set, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [...Sentry.getAutoPerformanceIntegrations()],
    tracesSampleRate: import.meta.dev ? 0 : 0.6,
    profilesSampleRate: import.meta.dev ? 0 : 1,
  });

  nitro.hooks.hook("request", (event) => {
    event.context.$sentry = Sentry;
  });

  nitro.hooks.hook("error", (error) => {
    if (error instanceof H3Error) {
      if (error.statusCode === 404 || error.statusCode === 422) {
        return;
      }
    }
    Sentry.captureException(error);
  });

  nitro.hooks.hookOnce("close", async () => {
    await Sentry.close(5000);
  });
});
