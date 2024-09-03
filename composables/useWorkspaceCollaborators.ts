import type { TaskWithAssignees, User } from "~/server/db/schema";

export const useWorkspaceCollaborators = (
  workspaceId: MaybeRefOrGetter<string>,
) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: ["workspace-collaborators", workspaceId],
      queryFn: () =>
        useRequestFetch()(
          `/api/workspace/${toValue(workspaceId)}/collaborators`,
        ).then((users) => users as User[]),
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
          ["workspace-collaborators", workspaceId],
          (users: User[]) => users?.filter((user) => user.id !== userId) ?? [],
        );

        // Collaborators who have been removed from a workspace are
        // automatically removed as assignees from all tasks in that
        // workspace, so we need to update the cache accordingly.
        client.setQueriesData<TaskWithAssignees>(
          { predicate: (query) => query.queryKey?.[0] === "task" },
          (task) => updateInCacheTask(task, workspaceId, userId),
        );

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
