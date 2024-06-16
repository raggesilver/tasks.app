import { AUTHORIZED_REDIRECT } from "~/lib/constants";
import { getOrCreateUser } from "~/server/services/user";

export default oauth.githubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user: profile }) {
    const user = await getOrCreateUser("github", profile);
    await setUserSession(event, {
      user,
    });
    return sendRedirect(event, AUTHORIZED_REDIRECT);
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("GitHub OAuth error:", error, event);
    return sendRedirect(event, "/");
  },
});
