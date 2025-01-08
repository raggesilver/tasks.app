import {
  queryOptions,
  type UndefinedInitialQueryOptions,
} from "@tanstack/vue-query";
import { getWorkspacesOptions } from "~/composables/useWorkspaces";
import { normalizeDates } from "~/lib/utils";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from "~/lib/validation";
import type { Workspace } from "~~/server/db/schema";

export const getWorkspaceOptions = (id: MaybeRefOrGetter<string>) =>
  queryOptions<Workspace>({
    queryKey: ["workspace", id],
  });

export const useWorkspace = <T extends UndefinedInitialQueryOptions>(
  id: MaybeRefOrGetter<string>,
  extraOptions: Partial<T> = {},
) => {
  const client = useQueryClient();

  return useQuery(
    {
      ...extraOptions,
      queryKey: getWorkspaceOptions(id).queryKey,
      queryFn: () =>
        useRequestFetch()(`/api/workspace/${toValue(id)}`).then((response) =>
          normalizeDates<Workspace>(response),
        ),
    },
    client,
  );
};

export const useCreateWorkspaceMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceInput) =>
      useRequestFetch()("/api/workspace", {
        method: "POST",
        body: data,
      }).then((response) => normalizeDates<Workspace>(response)),
    onSuccess: (workspace) => {
      client.setQueryData(
        getWorkspaceOptions(workspace.id).queryKey,
        workspace,
      );
      client.setQueryData(getWorkspacesOptions().queryKey, (workspaces) =>
        workspaces ? [workspace, ...workspaces] : undefined,
      );
    },
  });
};

export const useUpdateWorkspaceMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceInput }) =>
      useRequestFetch()(`/api/workspace/${id}`, {
        method: "PUT",
        body: data,
      }).then((response) => normalizeDates<Workspace>(response)),
    onSuccess: (workspace) => {
      client.setQueryData(
        getWorkspaceOptions(workspace.id).queryKey,
        workspace,
      );
      client.setQueryData(getWorkspacesOptions().queryKey, (workspaces) =>
        workspaces?.concat(workspace),
      );
    },
  });
};
