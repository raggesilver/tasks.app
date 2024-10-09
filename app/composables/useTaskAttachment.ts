import { normalizeDates } from "~/lib/utils";
import type { Attachment } from "~~/server/db/schema";

export const useAddTaskAttachmentMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: async ({
        taskId,
        file,
      }: {
        taskId: string;
        boardId: string;
        columnId: string;
        file: File;
      }) => {
        const query = new URLSearchParams({
          name: file.name,
          mimeType: file.type || "application/octet-stream",
        });

        return useRequestFetch()(`/api/task/${taskId}/attachment?${query}`, {
          method: "put",
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": file.size.toString(),
          },
        }).then((response) => normalizeDates<Attachment>(response));
      },
      onSuccess(response, { taskId, columnId }) {
        const task = client.getQueryData(getTaskOptions(taskId).queryKey);

        if (!task) return;

        client.setQueryData(getTaskOptions(taskId).queryKey, (task) =>
          task
            ? { ...task, attachments: task.attachments.concat(response) }
            : task,
        );

        client.setQueryData(
          getStatusColumnTasksOptions(columnId).queryKey,
          (tasks) =>
            tasks?.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    attachments: t.attachments.concat(response),
                  }
                : t,
            ),
        );

        client.invalidateQueries(getStatusColumnTasksOptions(columnId));
      },
    },
    client,
  );
};

export const useDeleteTaskAttachmentMutation = () => {
  const client = useQueryClient();

  return useMutation(
    {
      mutationFn: async (attachment: Attachment) =>
        useRequestFetch()<null>(`/api/attachment/${attachment.id}`, {
          method: "delete",
        }),
      onSuccess(_, attachment) {
        const task = client.getQueryData(
          getTaskOptions(attachment.taskId).queryKey,
        );

        if (!task) return;

        client.setQueryData(getTaskOptions(task.id).queryKey, (task) => {
          if (!task) return task;
          return {
            ...task,
            attachments: task.attachments.filter((a) => a.id !== attachment.id),
          };
        });

        client.setQueryData(
          getStatusColumnTasksOptions(task.statusColumnId).queryKey,
          (tasks) =>
            tasks?.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    attachments: t.attachments.filter(
                      (a) => a.id !== attachment.id,
                    ),
                  }
                : t,
            ),
        );

        client.removeQueries({
          queryKey: getStatusColumnTasksOptions(attachment.id).queryKey,
        });
      },
    },
    client,
  );
};
