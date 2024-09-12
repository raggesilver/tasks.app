import {
  captureException,
  close,
  getAutoPerformanceIntegrations,
  init,
} from "@sentry/node";
import { H3Error } from "h3";

export default defineNitroPlugin((nitro) => {
  const {
    public: { sentry },
  } = useRuntimeConfig();

  if (!sentry.dsn) {
    console.warn("Sentry DSN is not set, skipping Sentry initialization");
    return;
  }

  init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [...getAutoPerformanceIntegrations()],
    tracesSampleRate: import.meta.dev ? 0.2 : 1.0,
    profilesSampleRate: 1,
  });

  nitro.hooks.hook("request", (event) => {
    event.context.$sentry = { captureException };
  });

  nitro.hooks.hook("error", (error) => {
    if (error instanceof H3Error) {
      if (error.statusCode === 404 || error.statusCode === 422) {
        return;
      }
    }
    captureException(error);
  });

  nitro.hooks.hookOnce("close", async () => {
    await close(5000);
  });
});
