import { updateWorkspaceSchema } from "~/lib/validation";
import { updateWorkspaceById } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const id = getRouterParam(event, "id")!;

  const data = await readValidatedBody(event, updateWorkspaceSchema.parseAsync);

  const workspace = await updateWorkspaceById(id, data);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  return workspace;
});
