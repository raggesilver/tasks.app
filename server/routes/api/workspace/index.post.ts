import { createWorkspaceSchema } from "~/lib/validation";
import { createWorkspace } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { name } = await readValidatedBody(event, createWorkspaceSchema.parse);

  const workspace = await createWorkspace(user.id, { name });

  return workspace;
});
