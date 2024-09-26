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
        workspaceId: string;
        columnId: string;
        file: File;
      }) => {
        const query = new URLSearchParams({
          originalName: file.name,
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
        client.setQueryData(getTaskOptions(taskId).queryKey, (task) => {
          if (!task) return task;
          return {
            ...task,
            attachments: task.attachments.concat(response),
          };
        });

        client.invalidateQueries(getStatusColumnTasksOptions(columnId));
      },
    },
    client,
  );
};
