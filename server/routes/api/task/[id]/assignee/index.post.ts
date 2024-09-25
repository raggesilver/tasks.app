import { addAssigneeSchema, validateId } from "~/lib/validation";
import { DuplicateError, NotFoundError } from "~~/server/lib/errors";
import { isUserWorkspaceCollaboratorForTask } from "~~/server/services/authorization";
import { addAssigneeToTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserWorkspaceCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this task",
    });
  }

  const { userId } = await readValidatedBody(
    event,
    addAssigneeSchema.parseAsync,
  );

  return addAssigneeToTask(taskId, userId).catch((e) => {
    if (e instanceof NotFoundError) {
      return sendNoContent(event, 404);
    } else if (e instanceof DuplicateError) {
      return sendNoContent(event, 409);
    }
    throw e;
  });
});
