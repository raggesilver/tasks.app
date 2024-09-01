import { addAssigneeSchema } from "~/lib/validation";
import { DuplicateError, NotFoundError } from "~/server/lib/errors";
import { addAssigneeToTask } from "~/server/services/task";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  // TODO: validate that the user is a member of the workspace and has
  // permission to add assignees

  const taskId = getRouterParam(event, "id")!;
  const { userId } = await readValidatedBody(event, addAssigneeSchema.parse);

  return addAssigneeToTask(taskId, userId).catch((e) => {
    if (e instanceof NotFoundError) {
      return sendNoContent(event, 404);
    } else if (e instanceof DuplicateError) {
      return sendNoContent(event, 409);
    }
    throw e;
  });
});
