import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(5).max(255),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(5).max(255),
});

export const createStatusColumnSchema = z.object({
  name: z.string().min(5).max(255),
});

export const updateStatusColumnSchema = createStatusColumnSchema
  .merge(
    z.object({
      order: z.number().int(),
    }),
  )
  .partial();

export const createTaskSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(5),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(4),
    description: z.string().min(5),
    statusColumnId: z.string().uuid(),
    order: z.number().int(),
  })
  .partial();

export const searchUsersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
});

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email().optional(),
  profilePictureUrl: z.string().url().optional(),
});

export const createInvitationSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const deactivateInvitationSchema = z.object({
  invitationId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export const addAssigneeSchema = z.object({
  userId: z.string().uuid(),
});

export const createWorkspaceLabelSchema = z.object({
  name: z.string().min(3).max(255),
  color: z.string(),
  workspaceId: z.string().uuid(),
});

export const updateWorkspaceLabelSchema = createWorkspaceLabelSchema
  .omit({ workspaceId: true })
  .partial();

export const addTaskLabelSchema = z.object({
  labelId: z.string().uuid(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export type CreateStatusColumnInput = z.infer<typeof createStatusColumnSchema>;
export type UpdateStatusColumnInput = z.infer<typeof updateStatusColumnSchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;

export type PublicUser = z.infer<typeof publicUserSchema>;

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type DeactivateInvitationInput = z.infer<
  typeof deactivateInvitationSchema
>;

export type AddAssigneeInput = z.infer<typeof addAssigneeSchema>;

export type CreateWorkspaceLabelInput = z.infer<
  typeof createWorkspaceLabelSchema
>;

export type UpdateWorkspaceLabelInput = z.infer<
  typeof updateWorkspaceLabelSchema
>;

export type AddTaskLabelInput = z.infer<typeof addTaskLabelSchema>;

export const validateId = <T extends string>(id: T) =>
  z.object({ [id]: z.string().uuid() });