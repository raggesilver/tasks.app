import { UNAUTHORIZED_REDIRECT } from "~/lib/constants";

export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  return sendRedirect(event, UNAUTHORIZED_REDIRECT);
});
