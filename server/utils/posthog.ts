import { PostHog } from "posthog-node";

export const usePosthog = () => {
  const runtimeConfig = useRuntimeConfig();
  const posthog = new PostHog(runtimeConfig.public.posthogPublicKey, {
    host: runtimeConfig.public.posthogHost || "https://us.i.posthog.com",
  });

  return posthog;
};
