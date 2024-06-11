import { publicUserSchema, searchUsersSchema } from "~/lib/validation";
import { searchUsers } from "~/server/services/user";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const data = await getValidatedQuery(event, searchUsersSchema.parseAsync);

  const users = await searchUsers(data);

  return publicUserSchema.array().parseAsync(users);
});
