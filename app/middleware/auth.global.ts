export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value && to.path.startsWith("/app")) {
    return navigateTo({ path: "/sign-in", query: { redirectTo: to.fullPath } });
  }

  const redirectTo = useCookie("signInRedirect", {
    path: "/",
    maxAge: 60 * 5,
  });

  // We store a redirect path in a cookie when the user is not logged in
  // and tries to access a protected route. Here we check if the user is
  // logged in and if there is a redirect path in the cookie. If both
  // conditions are met, we redirect the user to the stored path.
  if (
    loggedIn.value &&
    typeof redirectTo.value === "string" &&
    to.path !== redirectTo.value
  ) {
    const path = redirectTo.value;
    redirectTo.value = null;
    return navigateTo({ path }, { external: path.startsWith("/api") });
  }
});
