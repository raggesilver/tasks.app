import { AUTHORIZED_REDIRECT, UNAUTHORIZED_REDIRECT } from "~/lib/constants";
import { getOrCreateUser } from "~/server/services/user";

export default oauthGoogleEventHandler({
  config: {
    ...(import.meta.dev && {
      redirectURL: "https://localhost:3000/auth/google",
    }),
  },
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
    const search = new URLSearchParams({ error: error.message });
    return sendRedirect(event, `${UNAUTHORIZED_REDIRECT}?${search}`);
  },
});
