import { z } from "zod";

export const createWorkspaceSchema = z.object({
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

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export type CreateStatusColumnInput = z.infer<typeof createStatusColumnSchema>;
export type UpdateStatusColumnInput = z.infer<typeof updateStatusColumnSchema>;
