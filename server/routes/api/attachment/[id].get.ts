import { validateId } from "~/lib/validation";
import { db } from "~~/server/db/db";
import { isUserWorkspaceCollaborator } from "~~/server/services/authorization";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  // Authorization
  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  const attachment = await db.query.attachments.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  });

  if (!attachment) {
    throw createError({
      status: 404,
      message: "Attachment not found",
    });
  }

  if (
    false ===
    (await isUserWorkspaceCollaborator(user.id, attachment.workspaceId))
  ) {
    throw createError({
      status: 403,
      message: "You are not authorized to view this attachment",
    });
  }

  const isDownload = "download" in getQuery(event);

  // TODO: add metrics for uncached requests

  const storage = useStorageS3(event);
  const url = await storage.getPresignedDownloadUrl(attachment, isDownload);

  if (isDownload) {
    const response = await fetch(url);

    if (!response.ok) {
      throw createError({
        status: response.status,
        message: "Failed to fetch attachment",
      });
    }

    setResponseHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${attachment.name}"`,
    );

    setResponseHeader(event, "Content-Type", attachment.mimeType);

    return sendStream(event, response.body!);
  }

  // Cache the redirect for 30 days. This matches the value set in Tigris, which
  // will set cache-control headers on the resolved URL. Things will go bad if
  // this is longer than the cache-control header set by Tigris.
  //
  // Also, we must set the cache control header to private, otherwise CDNs
  // might serve cached content to unauthorized users.
  setResponseHeader(event, "Cache-Control", "private, max-age=2592000");

  return sendRedirect(event, url, 303);
});
