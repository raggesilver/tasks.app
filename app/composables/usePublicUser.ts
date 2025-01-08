import { queryOptions } from "@tanstack/vue-query";
import type { PublicUser } from "~/lib/validation";

export const getPublicUserOptions = (userId: MaybeRefOrGetter<string>) =>
  queryOptions<PublicUser>({
    queryKey: ["public-user", userId],
  });

export const usePublicUser = (userId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getPublicUserOptions(userId).queryKey,
      queryFn: () =>
        useRequestFetch()(`/api/user/${toValue(userId)}`).then(
          (response) => response as PublicUser,
        ),
    },
    client,
  );
};
