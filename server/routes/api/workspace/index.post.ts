import { createWorkspaceSchema } from "~/lib/validation";
import { createWorkspace } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const data = await readValidatedBody(event, createWorkspaceSchema.parseAsync);

  const workspace = await createWorkspace({ ...data, ownerId: user.id });

  setResponseStatus(event, 201);
  return workspace;
});
