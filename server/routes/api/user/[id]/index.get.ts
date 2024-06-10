import { getUserById } from "~/server/services/user";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const userId = getRouterParam(event, "id")!;

  const user = await getUserById(userId);

  if (!user) {
    throw createError({ status: 404, message: "User not found" });
  }

  const { fullName, id, profilePictureUrl } = user;

  return { fullName, id, profilePictureUrl };
});
