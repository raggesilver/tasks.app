import { publicUserSchema, searchUsersSchema } from "~/lib/validation";
import { searchUsers } from "~~/server/services/user";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  // TODO: we still need to set better rules for how users are able to search
  // for others. Currently, any user can search for any other user, which is
  // (likely) not ideal. In the future, we may want to narrow the search on a
  // workspace basis — users will only be able to search for other users within
  // the same workspace.
  //
  // The same goes for the get user endpoint.

  const data = await getValidatedQuery(event, searchUsersSchema.parseAsync);

  return searchUsers(data).then(publicUserSchema.array().parseAsync);
});
