import { getAllWorkspaces } from "~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    console.log("No user", JSON.stringify(event.node.req, null, 2));

    throw createError({ status: 401, message: "Unauthorized" });
  }

  return getAllWorkspaces(session.user.id);
});
