import { getAllWorkspaces } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  console.log({ user: session.user });

  if (!session.user) {
    throw createError({ status: 401, message: "Unauthorized" });
  }

  return getAllWorkspaces(session.user.id);
});
