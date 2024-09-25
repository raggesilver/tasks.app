import { UNAUTHORIZED_REDIRECT } from "~/lib/constants";

export const useLogout = () => {
  const { loggedIn, clear } = useUserSession();
  const router = useRouter();

  const logout = async () => {
    if (loggedIn.value) {
      await clear().then(() => router.push(UNAUTHORIZED_REDIRECT));
    }
  };

  return { logout };
};
