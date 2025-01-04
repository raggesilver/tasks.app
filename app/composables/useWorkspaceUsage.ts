export const useWorkspaceUsage = (workspaceId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: ["workspace", workspaceId, "usage"],
      queryFn: async () =>
        useRequestFetch()(`/api/workspace/${toValue(workspaceId)}/usage`),
    },
    client,
  );
};
