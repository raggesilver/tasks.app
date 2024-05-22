import { migrate } from "../db/migrate";

export default defineNitroPlugin(async () => {
  await migrate().then(() => console.log("Migrations run successfully 🎉"));
});
