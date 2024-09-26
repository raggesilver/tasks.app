import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
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
    // This is now handled with unique constraint created manually in migartion
    // 0004_dusty_hitman.sql
    // orderIndex: uniqueIndex().on(table.workspaceId, table.order),
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
    pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
  }),
);

export type Collaborator = typeof collaborators.$inferSelect;
export type NewCollaborator = typeof collaborators.$inferInsert;

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    statusColumnId: uuid("status_column_id")
      .notNull()
      .references(() => statusColumns.id, {
        onDelete: "cascade",
      }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    //order: integer("order").notNull(),
    createdById: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    lastUpdatedById: uuid("last_updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  () => ({
    // Tasks are ordered by created_at for now.
    // uniqueIndex: uniqueIndex().on(table.workspaceId, table.statusColumnId, table.order),
  }),
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const assignees = pgTable(
  "assignees",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, {
        onDelete: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    index: primaryKey({ columns: [table.taskId, table.userId] }),
  }),
);

export type Assignee = typeof assignees.$inferSelect;
export type NewAssignee = typeof assignees.$inferInsert;

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      // onDelete: "cascade", // We need to remove the file from S3
    }),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, {
      // onDelete: "cascade", // We need to remove the file from S3
    }),
  // commentId: uuid("comment_id").references(() => comments.id, {
  //   onDelete: "cascade",
  // }),
  name: varchar("name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  size: integer("size").notNull(),
  // Later we may want to store alt text for images, duration for videos, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

export const labels = pgTable("labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 255 }).notNull(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

export const taskLabels = pgTable(
  "task_labels",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, {
        onDelete: "cascade",
      }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => labels.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    index: primaryKey({ columns: [table.taskId, table.labelId] }),
  }),
);

export type TaskLabel = typeof taskLabels.$inferSelect;
export type NewTaskLabel = typeof taskLabels.$inferInsert;

export const invitationLinks = pgTable(
  "invitation_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // In the future we may allow restricting invitations to specific email(s)
    // email: varchar("email", { length: 255 }).notNull(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    // expiresAt: timestamp("expires_at").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // We need to make sure that we don't have multiple active invitation links
    // for the same workspace.
    uniqueIndex: uniqueIndex()
      .on(table.workspaceId, table.active)
      .where(sql`${table.active} = true`),
  }),
);

export type InvitationLink = typeof invitationLinks.$inferSelect;
export type NewInvitationLink = typeof invitationLinks.$inferInsert;

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

export const statusColumnsRelations = relations(
  statusColumns,
  ({ one, many }) => ({
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
    tasks: many(tasks),
  }),
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id],
  }),
  statusColumn: one(statusColumns, {
    fields: [tasks.statusColumnId],
    references: [statusColumns.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
  lastUpdatedBy: one(users, {
    fields: [tasks.lastUpdatedById],
    references: [users.id],
  }),
  assignees: many(assignees),
  labels: many(taskLabels),
  attachments: many(attachments),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [labels.workspaceId],
    references: [workspaces.id],
  }),
  tasks: many(taskLabels),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const assigneesRelations = relations(assignees, ({ one }) => ({
  task: one(tasks, {
    fields: [assignees.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [assignees.userId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [attachments.workspaceId],
    references: [workspaces.id],
  }),
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export type TaskWithAssignees = Task & { assignees: Assignee[] };

/**
 * This is a type that represents a task with all the related data.
 * It's useful when we want to fetch a task with all the related data in one
 * query.
 */
export type TaskWithEverything = Task & {
  labels: TaskLabel[];
  assignees: Assignee[];
  attachments: Attachment[];
};
