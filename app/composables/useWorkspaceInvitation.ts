import { queryOptions } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { InvitationLink } from "~~/server/db/schema";

export const getWorkspaceInvitationLinkOptions = (
  workspaceId: MaybeRefOrGetter<string>,
) =>
  queryOptions<InvitationLink | null>({
    queryKey: ["workspace", workspaceId, "active-invitation-link"],
  });

export const useWorkspaceInvitationLink = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspaceInvitationLinkOptions(workspaceId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/workspace/${toValue(workspaceId)}/active-invitation`,
        ).then((response) =>
          response ? normalizeDates<InvitationLink>(response) : null,
        ),
    },
    client,
  );
};

export const useCreateWorkspaceInvitationLinkMutation = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () =>
      useRequestFetch()(`/api/invitation`, {
        method: "POST",
        body: { workspaceId: toValue(workspaceId) },
      }).then((response) => normalizeDates<InvitationLink>(response)),
    onSuccess: (result) => {
      client.setQueryData(
        getWorkspaceInvitationLinkOptions(workspaceId).queryKey,
        result,
      );
    },
  });
};

export const useDeactivateWorkspaceInvitationLinkMutation = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (invitationLinkId: string) =>
      useRequestFetch()<InvitationLink>(
        `/api/invitation/${invitationLinkId}/deactivate`,
        {
          method: "POST",
        },
      ),
    onSuccess: async (result) => {
      const activeWorkspaceInvitationLink = client.getQueryData(
        getWorkspaceInvitationLinkOptions(workspaceId).queryKey,
      );

      console.log({ result, activeWorkspaceInvitationLink });

      if (activeWorkspaceInvitationLink?.id === result.id) {
        client.setQueryData(
          getWorkspaceInvitationLinkOptions(workspaceId).queryKey,
          null,
        );
      }
    },
  });
};
