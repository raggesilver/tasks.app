import { migrate } from "../db/migrate";

export default defineNitroPlugin(async () => {
  if (!import.meta.prerender) {
    await migrate().then(() => console.log("Migrations run successfully 🎉"));
  }
});
