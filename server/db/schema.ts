import { relations, sql } from "drizzle-orm";
import { check, pgTable, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    fullName: t.varchar("full_name", { length: 255 }).notNull(),
    email: t.varchar("email", { length: 255 }).notNull(),
    profilePictureUrl: t.varchar("profile_picture_url", { length: 255 }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
  }),
  (t) => [uniqueIndex("users_email_index").on(t.email)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const oauth = pgTable(
  "oauth",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: t.varchar("provider", { length: 255 }).notNull(),
    userIdInProvider: t
      .varchar("user_id_in_provider", { length: 255 })
      .notNull(),
  }),
  (t) => [uniqueIndex("oauth_provider_user_id_index").on(t.provider, t.userId)],
);

export type OauthEntity = typeof oauth.$inferSelect;
export type NewOauthEntity = typeof oauth.$inferInsert;

export const workspaces = pgTable("workspaces", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  name: t.varchar("name", { length: 255 }).notNull(),
  ownerId: t
    .uuid("owner_id")
    .notNull()
    .references(() => users.id),

  // Each workspace is its own customer in Stripe.
  customerId: t.varchar("customer_id", { length: 255 }),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}));

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export const boards = pgTable(
  "boards",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    name: t.varchar("name", { length: 255 }).notNull(),
    ownerId: t
      .uuid("owner_id")
      .notNull()
      .references(() => users.id),
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
  }),
  (t) => [
    uniqueIndex("boards_workspace_id_name_index").on(t.workspaceId, t.name),
  ],
);

export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;

export const statusColumns = pgTable(
  "status_columns",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    boardId: t
      .uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    name: t.varchar("name", { length: 255 }).notNull(),
    order: t.integer("order").notNull(),
    createdById: t
      .uuid("created_by")
      .references(() => users.id, { onDelete: "set null" }),
    lastUpdatedById: t
      .uuid("last_updated_by")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
  }),
  (t) => [
    uniqueIndex("status_columns_board_id_name_index").on(t.boardId, t.name),
  ],
);

export type StatusColumn = typeof statusColumns.$inferSelect;
export type NewStatusColumn = typeof statusColumns.$inferInsert;

export const collaborators = pgTable(
  "collaborators",
  (t) => ({
    boardId: t
      .uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (t) => [
    uniqueIndex("collaborators_board_id_user_id_index").on(t.boardId, t.userId),
    primaryKey({ columns: [t.boardId, t.userId] }),
  ],
);

export type Collaborator = typeof collaborators.$inferSelect;
export type NewCollaborator = typeof collaborators.$inferInsert;

export const workspaceCollaborators = pgTable(
  "workspace_collaborators",
  (t) => ({
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (t) => [primaryKey({ columns: [t.workspaceId, t.userId] })],
);

export type WorkspaceCollaborator = typeof workspaceCollaborators.$inferSelect;
export type NewWorkspaceCollaborator =
  typeof workspaceCollaborators.$inferInsert;

export const tasks = pgTable("tasks", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  boardId: t
    .uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  statusColumnId: t
    .uuid("status_column_id")
    .notNull()
    .references(() => statusColumns.id, { onDelete: "cascade" }),
  title: t.varchar("title", { length: 255 }).notNull(),
  description: t.text("description"),
  createdById: t
    .uuid("created_by")
    .references(() => users.id, { onDelete: "set null" }),
  lastUpdatedById: t
    .uuid("last_updated_by")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const assignees = pgTable(
  "assignees",
  (t) => ({
    taskId: t
      .uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (t) => [primaryKey({ columns: [t.taskId, t.userId] })],
);

export type Assignee = typeof assignees.$inferSelect;
export type NewAssignee = typeof assignees.$inferInsert;

export const attachments = pgTable("attachments", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  boardId: t
    .uuid("board_id")
    .notNull()
    .references(() => boards.id),
  taskId: t
    .uuid("task_id")
    .notNull()
    .references(() => tasks.id),
  name: t.varchar("name", { length: 255 }).notNull(),
  mimeType: t.varchar("mime_type", { length: 255 }).notNull(),
  size: t.integer("size").notNull(),
  uploadedBy: t
    .uuid("uploaded_by")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
}));

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

export const labels = pgTable("labels", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  name: t.varchar("name", { length: 255 }).notNull(),
  color: t.varchar("color", { length: 255 }).notNull(),
  boardId: t
    .uuid("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}));

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

export const taskLabels = pgTable(
  "task_labels",
  (t) => ({
    taskId: t
      .uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: t
      .uuid("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  }),
  (t) => [primaryKey({ columns: [t.taskId, t.labelId] })],
);

export type TaskLabel = typeof taskLabels.$inferSelect;
export type NewTaskLabel = typeof taskLabels.$inferInsert;

export const invitationLinks = pgTable(
  "invitation_links",
  (t) => ({
    id: t.uuid("id").primaryKey().defaultRandom(),
    // In the future we may allow restricting invitations to specific email(s)
    // email: varchar("email", { length: 255 }).notNull(),
    workspaceId: t.uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    boardId: t.uuid("board_id").references(() => boards.id, {
      onDelete: "cascade",
    }),
    // expiresAt: timestamp("expires_at").notNull(),
    active: t.boolean("active").notNull().default(true),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  }),
  (t) => [
    // Unique constraint for active workspace invites
    uniqueIndex("invitation_links_workspace_id_active_index")
      .on(t.workspaceId, t.active)
      .where(sql`${t.active} = true AND ${t.workspaceId} IS NOT NULL`),
    // Unique constraint for active board invites
    uniqueIndex("invitation_links_board_id_active_index")
      .on(t.boardId, t.active)
      .where(sql`${t.active} = true AND ${t.boardId} IS NOT NULL`),
    check(
      "valid_invitation_target",
      sql`(
        (${t.workspaceId} IS NULL AND ${t.boardId} IS NOT NULL) OR 
        (${t.workspaceId} IS NOT NULL AND ${t.boardId} IS NULL)
      )`,
    ),
  ],
);

type _InvitationLink = Omit<
  typeof invitationLinks.$inferSelect,
  "boardId" | "workspaceId"
>;

export type InvitationLink = _InvitationLink &
  (
    | {
        workspaceId: string;
        boardId: null;
      }
    | {
        workspaceId: null;
        boardId: string;
      }
  );
export type NewInvitationLink = typeof invitationLinks.$inferInsert;

export const plans = pgTable("plans", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  name: t.varchar("name", { length: 255 }).notNull(),
  // We store the price in Stripe only to avoid out-of-sync issues.

  // Subscription id in Stripe.
  subscriptionId: t.varchar("subscription_id", { length: 255 }).notNull(),
  // FIXME: onDelete: "cascade" could be problematic if we delete a workspace
  //  without canceling the subscription first.
  workspaceId: t
    .uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
}));

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

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
  board: one(boards, {
    fields: [collaborators.boardId],
    references: [boards.id],
  }),
}));

export const workspaceCollaboratorsRelations = relations(
  workspaceCollaborators,
  ({ one }) => ({
    user: one(users, {
      fields: [workspaceCollaborators.userId],
      references: [users.id],
    }),
    workspace: one(workspaces, {
      fields: [workspaceCollaborators.workspaceId],
      references: [workspaces.id],
    }),
  }),
);

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.ownerId],
    references: [users.id],
  }),
  collaborators: many(collaborators),
  statusColumns: many(statusColumns),
  workspace: one(workspaces, {
    fields: [boards.workspaceId],
    references: [workspaces.id],
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  boards: many(boards),
}));

export const statusColumnsRelations = relations(
  statusColumns,
  ({ one, many }) => ({
    board: one(boards, {
      fields: [statusColumns.boardId],
      references: [boards.id],
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
  board: one(boards, {
    fields: [tasks.boardId],
    references: [boards.id],
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
  board: one(boards, {
    fields: [labels.boardId],
    references: [boards.id],
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
  board: one(boards, {
    fields: [attachments.boardId],
    references: [boards.id],
  }),
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export type TaskWithAssignees = Task & { assignees: Assignee[] };

/**
 * This is a type that represents a task with all the related data. It's useful
 * when we want to fetch a task with all the related data in one query.
 */
export type TaskWithEverything = Task & {
  labels: TaskLabel[];
  assignees: Assignee[];
  attachments: Attachment[];
};
