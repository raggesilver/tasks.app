import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIndex: uniqueIndex().on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const oauth = pgTable(
  "oauth",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 255 }).notNull(),
    userIdInProvider: varchar("user_id_in_provider", { length: 255 }).notNull(),
  },
  (table) => ({
    index: uniqueIndex().on(table.provider, table.userId),
    // This is not working for some reason... Drizzle Kit spits this out:
    //
    // TypeError: Cannot read properties of undefined
    // (reading 'compositePrimaryKeys')
    // index: primaryKey({ columns: [table.provider, table.userId] }),
  }),
);

export type OauthEntity = typeof oauth.$inferSelect;
export type NewOauthEntity = typeof oauth.$inferInsert;

// Relations

export const oauthRelations = relations(oauth, ({ one }) => ({
  user: one(users, {
    fields: [oauth.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  oauth: many(oauth),
}));
