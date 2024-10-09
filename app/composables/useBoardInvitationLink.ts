import { queryOptions } from "@tanstack/vue-query";
import { normalizeDates } from "~/lib/utils";
import type { InvitationLink } from "~~/server/db/schema";

export const getBoardInvitationLinkOptions = (
  boardId: MaybeRefOrGetter<string>,
) =>
  queryOptions<InvitationLink | null>({
    queryKey: ["board", boardId, "active-invitation-link"],
  });

export const useBoardInvitationLink = (boardId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getBoardInvitationLinkOptions(boardId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/board/${toValue(boardId)}/active-invitation`,
        ).then((response) =>
          response ? normalizeDates<InvitationLink>(response) : null,
        ),
    },
    client,
  );
};

export const useCreateBoardInvitationLinkMutation = (
  boardId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () =>
      useRequestFetch()(`/api/invitation`, {
        method: "POST",
        body: { boardId: toValue(boardId) },
      }).then((response) => normalizeDates<InvitationLink>(response)),
    onSuccess: (result) => {
      client.setQueryData(
        getBoardInvitationLinkOptions(boardId).queryKey,
        result,
      );
    },
  });
};

export const useDeactivateBoardInvitationLinkMutation = (
  boardId: MaybeRefOrGetter<string>,
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
      const activeBoardInvitationLink = client.getQueryData(
        getBoardInvitationLinkOptions(boardId).queryKey,
      );

      if (activeBoardInvitationLink?.id === result.id) {
        client.setQueryData(
          getBoardInvitationLinkOptions(boardId).queryKey,
          null,
        );
      }
    },
  });
};
