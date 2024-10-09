import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(5).max(255),
});

export const updateBoardSchema = z.object({
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
  boardId: z.string().uuid(),
});

export const deactivateInvitationSchema = z.object({
  invitationId: z.string().uuid(),
  boardId: z.string().uuid(),
});

export const addAssigneeSchema = z.object({
  userId: z.string().uuid(),
});

export const createBoardLabelSchema = z.object({
  name: z.string().min(3).max(255),
  color: z.string(),
  boardId: z.string().uuid(),
});

export const updateBoardLabelSchema = createBoardLabelSchema
  .omit({ boardId: true })
  .partial();

export const addTaskLabelSchema = z.object({
  labelId: z.string().uuid(),
});

export const uploadAttachmentSchema = z.object({
  originalName: z.string().min(1).max(255),
  contentLength: z.number().int().min(1).optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

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

export type CreateBoardLabelInput = z.infer<typeof createBoardLabelSchema>;

export type UpdateBoardLabelInput = z.infer<typeof updateBoardLabelSchema>;

export type AddTaskLabelInput = z.infer<typeof addTaskLabelSchema>;

export const validateId = <T extends string>(id: T) =>
  z.object({ [id]: z.string().uuid() });
