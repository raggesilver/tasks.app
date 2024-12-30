import { validateId } from "~/lib/validation";
import { db } from "~~/server/db/db";
import { attachmentService } from "~~/server/services/attachment";
import {
  isUserAllowedToDeleteAttachment,
  isUserBoardCollaboratorForAttachment,
} from "~~/server/services/authorization";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserBoardCollaboratorForAttachment(user.id, id))) {
    throw createError({
      status: 403,
      message: "You are not authorized to view this attachment",
    });
  }

  if (false === (await isUserAllowedToDeleteAttachment(user.id, id))) {
    throw createError({
      status: 403,
      message: "You are not authorized to delete this attachment",
    });
  }

  const attachment = (await db.query.attachments.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  }))!;

  const storage = useStorageS3(event);
  await attachmentService.deleteAttachments(storage, [attachment]);

  return sendNoContent(event, 204);
});
