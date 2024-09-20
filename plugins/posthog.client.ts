import { defineNuxtPlugin } from "#app";
import posthog from "posthog-js";

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
    api_host: runtimeConfig.public.posthogHost || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false, // we add manual pageview capturing below
    loaded: () => {
      // if (import.meta.dev) posthog.debug();
    },
  });

  // Make sure that pageviews are captured with each route change
  const router = useRouter();
  router.afterEach((to) => {
    nextTick(() => {
      posthog.capture("$pageview", {
        current_url: to.fullPath,
      });
    });
  });

  if (window !== undefined) {
    window.addEventListener("beforeunload", () => {
      posthog.capture(
        "$pageleave",
        { current_url: window.location.href },
        { send_instantly: true },
      );
    });
  } else {
    console.warn(
      "Skipping beforeunload event listener because window is not defined",
    );
  }

  return {
    provide: {
      posthog: () => posthogClient,
    },
  };
});
