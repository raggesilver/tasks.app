import { queryOptions } from "@tanstack/vue-query";
import type { PublicUser } from "~/lib/validation";
import type { TaskWithAssignees } from "~/server/db/schema";

export const getWorkspaceCollaboratorsOptions = (
  workspaceId: MaybeRefOrGetter<string>,
) =>
  queryOptions<PublicUser[]>({
    queryKey: ["workspace-collaborators", workspaceId],
  });

export const useWorkspaceCollaborators = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getWorkspaceCollaboratorsOptions(workspaceId).queryKey,
      queryFn: () =>
        useRequestFetch()(
          `/api/workspace/${toValue(workspaceId)}/collaborators`,
        ),
    },
    client,
  );
};

export const useRemoveWorkspaceCollaborator = () => {
  const client = useQueryClient();

  /**
   * Update the task in cache to remove the user from the assignees list.
   */
  const updateInCacheTask = <T extends TaskWithAssignees | undefined>(
    task: T,
    workspaceId: string,
    userId: string,
  ): T => {
    if (task?.workspaceId === workspaceId && task?.assignees) {
      return {
        ...task,
        assignees: task.assignees.filter(
          (assignee) => assignee.userId !== userId,
        ),
      };
    }
    return task;
  };

  return useMutation(
    {
      mutationFn: ({
        workspaceId,
        userId,
      }: {
        workspaceId: string;
        userId: string;
      }) =>
        useRequestFetch()(
          `/api/workspace/${workspaceId}/collaborator/${userId}`,
          { method: "DELETE" },
        ).then(() => ({ workspaceId, userId })),
      onSuccess: ({ workspaceId, userId }) => {
        client.setQueryData(
          getWorkspaceCollaboratorsOptions(workspaceId).queryKey,
          (users) => users?.filter((user) => user.id !== userId),
        );

        // Collaborators who have been removed from a workspace are
        // automatically removed as assignees from all tasks in that
        // workspace, so we need to update the cache accordingly.
        client.setQueriesData<TaskWithAssignees>(
          { predicate: (query) => query.queryKey?.[0] === "task" },
          (task) => updateInCacheTask(task, workspaceId, userId),
        );


        // FIXME: we need the ability to get status column tasks options without
        // a specified status column id. This will allow us to update the cache
        // for all status columns in a type-safe way.
        client.setQueriesData<TaskWithAssignees[]>(
          { queryKey: ["status-column-tasks"] },
          (tasks) =>
            tasks?.map((task) => updateInCacheTask(task, workspaceId, userId)),
        );
      },
    },
    client,
  );
};
