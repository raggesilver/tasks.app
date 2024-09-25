import { publicUserSchema, validateId } from "~/lib/validation";
import { getUserById } from "~~/server/services/user";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  const user = await getUserById(id);

  if (!user) {
    throw createError({ status: 404, message: "User not found" });
  }

  return publicUserSchema.parseAsync(user);
});
