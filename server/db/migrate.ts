import { drizzle } from "drizzle-orm/postgres-js";
import { migrate as _migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });

export const migrate = () =>
  _migrate(drizzle(client), {
    migrationsFolder: "drizzle",
  });
