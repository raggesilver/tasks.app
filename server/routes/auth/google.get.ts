import { AUTHORIZED_REDIRECT } from "~/lib/constants";
import { getOrCreateUser } from "~/server/services/user";

export default oauth.googleEventHandler({
  config: {},
  async onSuccess(event, { user: profile }) {
    const user = await getOrCreateUser("google", profile);
    await setUserSession(event, {
      user,
    });
    return sendRedirect(event, AUTHORIZED_REDIRECT);
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
