import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(5).max(255),
});

export const createStatusColumnSchema = z.object({
  name: z.string().min(5).max(255),
  order: z.number().int(),
  workspaceId: z.string().uuid(),
});

export const updateStatusColumnSchema = createStatusColumnSchema
  .omit({ workspaceId: true })
  .partial();

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export type CreateStatusColumnInput = z.infer<typeof createStatusColumnSchema>;
export type UpdateStatusColumnInput = z.infer<typeof updateStatusColumnSchema>;
