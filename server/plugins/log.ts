export default defineNitroPlugin((nitro) => {
  if (import.meta.prerender) {
    return;
  }

  nitro.hooks.hook("request", async (event) => {
    event.node.req.headers["start-time"] = new Date().toISOString();
  });

  nitro.hooks.hook("afterResponse", async (event) => {
    const { req, res } = event.node;
    const startTime = new Date(req.headers["start-time"] as string);
    const endTime = new Date().toISOString();
    const duration =
      new Date(endTime).getTime() - new Date(startTime).getTime();
    console.log(`${req.method} ${res.statusCode} ${duration}ms ${req.url}`);
  });
});
