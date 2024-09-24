import { getAllWorkspaces } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  return getAllWorkspaces(session.user.id);
});
