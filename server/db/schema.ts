import { relations } from "drizzle-orm";
import {
  integer,
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

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, {
        // TODO: we do need to handle worspaces and account deletion, but
        // cascading might not be the right call.
        // onDelete: "cascade",
      }),
    // TODO: add status columns and sunset status columns' order field.
    //statusColumnIds: uuid("status_column_ids").array().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIndex: uniqueIndex().on(table.slug),
  }),
);

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export const statusColumns = pgTable(
  "status_columns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    name: varchar("name", { length: 255 }).notNull(),
    order: integer("order").notNull(),
    createdById: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    lastUpdatedById: uuid("last_updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueIndex: uniqueIndex().on(table.workspaceId, table.name),
    // We cannot have two columns with the same order in the same workspace.
    orderIndex: uniqueIndex().on(table.workspaceId, table.order),
  }),
);

export type StatusColumn = typeof statusColumns.$inferSelect;
export type NewStatusColumn = typeof statusColumns.$inferInsert;

export const collaborators = pgTable(
  "collaborators",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    uniqueIndex: uniqueIndex().on(table.workspaceId, table.userId),
  }),
);

export type Collaborator = typeof collaborators.$inferSelect;
export type NewCollaborator = typeof collaborators.$inferInsert;

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

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  user: one(users, {
    fields: [collaborators.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [collaborators.workspaceId],
    references: [workspaces.id],
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  collaborators: many(collaborators),
  statusColumns: many(statusColumns),
}));

export const statusColumnsRelations = relations(statusColumns, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [statusColumns.workspaceId],
    references: [workspaces.id],
  }),
  lastUpdatedBy: one(users, {
    fields: [statusColumns.lastUpdatedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [statusColumns.createdById],
    references: [users.id],
  }),
  // tickets: many(tickets),
}));
