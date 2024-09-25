import { z } from "zod";
import { addTaskLabelSchema } from "~/lib/validation";
import { isPostgresError, PgErrorCode } from "~~/server/lib/errors";
import { isUserWorkspaceCollaboratorForTask } from "~~/server/services/authorization";
import { addLabelToTask } from "~~/server/services/task";

const paramSchema = z.object({ id: z.string().uuid() });

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId } = await getValidatedRouterParams(
    event,
    paramSchema.parseAsync,
  );

  if (false === (await isUserWorkspaceCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to modify this task",
    });
  }

  const data = await readValidatedBody(event, addTaskLabelSchema.parseAsync);

  try {
    await addLabelToTask(taskId, data.labelId);
    return sendNoContent(event, 204);
  } catch (e) {
    if (isPostgresError(e)) {
      // Check if foreign key constraint violation error (Task or label does not exist).
      if (e.code === PgErrorCode.FOREIGN_KEY_VIOLATION) {
        return sendNoContent(event, 404);
      } else if (e.code === PgErrorCode.UNIQUE_VIOLATION) {
        return sendNoContent(event, 409);
      }
    }
    throw e;
  }
});
