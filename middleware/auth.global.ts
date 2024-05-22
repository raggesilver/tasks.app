export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value && to.path.startsWith("/app")) {
    return navigateTo({ path: "/", query: { redirectTo: to.fullPath } });
  }
});
