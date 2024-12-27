import consola from "consola";

export default defineNitroPlugin((nitro) => {
  if (import.meta.prerender) return;

  consola.success("Posthog plugin loaded 🦔");

  nitro.hooks.hookOnce("close", async () => {
    const posthog = usePosthog();

    await posthog.shutdown();

    consola.success("Posthog client shut down 🦔");
  });
});
