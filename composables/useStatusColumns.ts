import type { StatusColumn } from "~/server/db/schema";

export const useStatusColumns = (workspaceId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();
  const {
    data,
    isLoading,
    suspense,
    error,
    // I have no clue what Vue does with rest destructuring, so I'm just going to
    // desctructure and return everything one by one.
    status,
    isError,
    isStale,
    refetch,
    isPaused,
    isFetched,
    isPending,
    isSuccess,
    isFetching,
    fetchStatus,
    failureCount,
    isRefetching,
    dataUpdatedAt,
    failureReason,
    errorUpdatedAt,
    isLoadingError,
    isRefetchError,
    errorUpdateCount,
    isPlaceholderData,
    isFetchedAfterMount,
  } = useQuery(
    {
      queryKey: ["workspace-columns", workspaceId],
      queryFn: () =>
        // We need to use `useRequestFetch` instead of `fetch` because of a bug
        // in Nuxt that doesn't include cookies in SSR requests.
        //
        // https://github.com/Atinux/nuxt-auth-utils/issues/97#issuecomment-2150442690
        //https://github.com/nuxt/nuxt/issues/24813
        useRequestFetch()(`/api/column/${toValue(workspaceId)}`).then(
          (columns) => {
            const normalized = columns.map((column) => {
              const ret: StatusColumn = {
                ...column,
                // Date objects are not deserialized properly, so we need to
                // convert them back to Date objects.
                createdAt: new Date(column.createdAt),
                updatedAt: new Date(column.updatedAt),
              };

              // Cache each workspace in the query client so that navigating to
              // the workspace page doesn't need to fetch the workspace again.
              client.setQueryData<StatusColumn>(["status-column", ret.id], ret);
              return ret;
            });

            return normalized;
          },
        ),
    },
    client,
  );

  return {
    data,
    isLoading,
    suspense,
    client,
    error,
    status,
    isError,
    isStale,
    refetch,
    isPaused,
    isFetched,
    isPending,
    isSuccess,
    isFetching,
    fetchStatus,
    failureCount,
    isRefetching,
    dataUpdatedAt,
    failureReason,
    errorUpdatedAt,
    isLoadingError,
    isRefetchError,
    errorUpdateCount,
    isPlaceholderData,
    isFetchedAfterMount,
  };
};
