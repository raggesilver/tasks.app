import { AUTHORIZED_REDIRECT, UNAUTHORIZED_REDIRECT } from "~/lib/constants";
import { getOrCreateUser, type GitHubProfile } from "~~/server/services/user";

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    ...(import.meta.dev && {
      redirectURL: "https://localhost:3000/auth/github",
    }),
  },
  async onSuccess(event, { user: profile }) {
    const user = await getOrCreateUser("github", profile as GitHubProfile);
    await setUserSession(event, {
      user,
    });
    return sendRedirect(event, AUTHORIZED_REDIRECT);
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    const search = new URLSearchParams({ error: error.message });
    return sendRedirect(event, `${UNAUTHORIZED_REDIRECT}?${search}`);
  },
});
