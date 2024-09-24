import createSlug from "slug";
import { createWorkspaceSchema } from "~/lib/validation";
import { createWorkspace } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({ status: 401, message: "Unauthorized" });
  }

  const { name } = await readValidatedBody(event, createWorkspaceSchema.parse);
  const slug = createSlug(name);

  const workspace = await createWorkspace(session.user.id, { name, slug });

  return workspace;
});
