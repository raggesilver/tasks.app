import { getAllWorkspaces } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  return getAllWorkspaces(user.id);
});
