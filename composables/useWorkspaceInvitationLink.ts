import type { InvitationLink } from "~/server/db/schema";

export const useWorkspaceInvitationLink = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  const { data: activeInvitationLink, ...rest } = useQuery(
    {
      queryKey: ["workspace", workspaceId, "active-invitation-link"],
      queryFn: (): Promise<InvitationLink | null> =>
        useRequestFetch()(
          `/api/workspace/${toValue(workspaceId)}/active-invitation`,
        ),
    },
    client,
  );

  const { mutateAsync: deactivateInvitationLink } = useMutation({
    mutationFn: (invitationLinkId: string) =>
      useRequestFetch()(`/api/invitation/${invitationLinkId}/deactivate`, {
        method: "POST",
      }),
    onSuccess: async (result) => {
      const activeWorkspaceInvitationLink =
        client.getQueryData<InvitationLink | null>([
          "workspace",
          workspaceId,
          "active-invitation-link",
        ]);

      if (activeWorkspaceInvitationLink?.id === result.id) {
        client.setQueryData<InvitationLink | null>(
          ["workspace", workspaceId, "active-invitation-link"],
          null,
        );
      }
    },
  });

  const { mutateAsync: createInvitationLink } = useMutation({
    mutationFn: (): Promise<InvitationLink> =>
      useRequestFetch()(`/api/invitation`, {
        method: "POST",
        body: { workspaceId: toValue(workspaceId) },
      }),
    onSuccess: (result) => {
      client.setQueryData<InvitationLink | null>(
        ["workspace", workspaceId, "active-invitation-link"],
        result,
      );
    },
  });

  return {
    activeInvitationLink,
    ...rest,
    deactivateInvitationLink,
    createInvitationLink,
  };
};
