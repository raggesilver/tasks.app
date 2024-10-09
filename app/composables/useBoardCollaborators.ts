import { queryOptions } from "@tanstack/vue-query";
import type { PublicUser } from "~/lib/validation";
import type { TaskWithAssignees } from "~~/server/db/schema";

export const getBoardCollaboratorsOptions = (
  boardId: MaybeRefOrGetter<string>,
) =>
  queryOptions<PublicUser[]>({
    queryKey: ["board-collaborators", boardId],
  });

export const useBoardCollaborators = (boardId: MaybeRefOrGetter<string>) => {
  const client = useQueryClient();

  return useQuery(
    {
      queryKey: getBoardCollaboratorsOptions(boardId).queryKey,
      queryFn: () =>
        useRequestFetch()(`/api/board/${toValue(boardId)}/collaborators`),
    },
    client,
  );
};

export const useRemoveBoardCollaborator = () => {
  const client = useQueryClient();

  /**
   * Update the task in cache to remove the user from the assignees list.
   */
  const updateInCacheTask = <T extends TaskWithAssignees | undefined>(
    task: T,
    boardId: string,
    userId: string,
  ): T => {
    if (task?.boardId === boardId && task?.assignees) {
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
      mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
        useRequestFetch()(`/api/board/${boardId}/collaborator/${userId}`, {
          method: "DELETE",
        }).then(() => ({ boardId, userId })),
      onSuccess: ({ boardId, userId }) => {
        client.setQueryData(
          getBoardCollaboratorsOptions(boardId).queryKey,
          (users) => users?.filter((user) => user.id !== userId),
        );

        // Collaborators who have been removed from a board are
        // automatically removed as assignees from all tasks in that
        // board, so we need to update the cache accordingly.
        client.setQueriesData<TaskWithAssignees>(
          { predicate: (query) => query.queryKey?.[0] === "task" },
          (task) => updateInCacheTask(task, boardId, userId),
        );

        // FIXME: we need the ability to get status column tasks options without
        // a specified status column id. This will allow us to update the cache
        // for all status columns in a type-safe way.
        client.setQueriesData<TaskWithAssignees[]>(
          { queryKey: ["status-column-tasks"] },
          (tasks) =>
            tasks?.map((task) => updateInCacheTask(task, boardId, userId)),
        );
      },
    },
    client,
  );
};
