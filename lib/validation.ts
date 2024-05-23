import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(5).max(255),
});
