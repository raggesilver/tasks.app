import { validateId } from "~/lib/validation";
import { db } from "~~/server/db/db";
import { attachmentService } from "~~/server/services/attachment";
import { isUserBoardCollaboratorForTask } from "~~/server/services/authorization";
import { deleteTask } from "~~/server/services/task";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id: taskId } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserBoardCollaboratorForTask(user.id, taskId))) {
    throw createError({
      status: 403,
      message: "You are not authorized to delete this task",
    });
  }

  const attachments = await db.query.attachments
    .findMany({
      where: (table, { eq }) => eq(table.taskId, taskId),
    })
    .execute();

  const storage = useStorageS3(event);
  // FIXME: this returns false when some attachment(s) are not deleted.
  if (attachments.length > 0) {
    await attachmentService.deleteAttachments(storage, attachments);
    console.log(`Deleted ${attachments.length} attachments for task ${taskId}`);
  }

  const result = await deleteTask(taskId);

  if (!result) {
    throw createError({ status: 404, message: "Task not found" });
  }

  return sendNoContent(event, 204);
});
