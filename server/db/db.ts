import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "~~/server/db/schema";

export const db = drizzle(postgres(process.env.DATABASE_URL!), {
  schema,
  logger: import.meta.dev && false,
});

export type DBTX = Parameters<Parameters<typeof db.transaction>[0]>[0];
