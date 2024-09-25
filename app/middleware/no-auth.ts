import { AUTHORIZED_REDIRECT } from "~/lib/constants";

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (loggedIn.value && to.path !== AUTHORIZED_REDIRECT) {
    return navigateTo(AUTHORIZED_REDIRECT);
  }
});
