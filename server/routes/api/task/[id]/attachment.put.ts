import { z } from "zod";
import { validateId } from "~/lib/validation";
import { db } from "~~/server/db/db";
import { type Attachment, attachments } from "~~/server/db/schema";
// import { isUserWorkspaceCollaboratorForTask } from "~~/server/services/authorization";
import { getTaskById } from "~~/server/services/task";

// Fly.io does not charge ingress fees or egress fees to Tigris, so we can
// forward the upload request to S3, intercept the response, process it, and
// return whatever we want to the client. This might not be as fast as browser
// to S3 direct uploads, but it's a lot more flexible.
//
// Tigris doesn't have support for upload notifications, so we need our server
// to know when a file is uploaded by actually making the request.
//
// The full workflow is:
//
// 1. User clicks upload button
// 2. Client sends PUT request to this endpoint
// 3. We validade then forward the request to S3
// 4. We receive the response from S3 and persist the upload on our database
// 5. We then return our persisted entry to the client
// 6. Client can now see the uploaded file

export default defineEventHandler(async (event) => {
  // FIXME: re-enable authentication once the UI is built and we no longer have
  // to test with cURL.
  // const { user } = await requireUserSession(event);

  // Reject large files before checking anything else
  const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB
  const contentLength = parseInt(getHeader(event, "content-length")!);
  if (contentLength > MAX_FILE_SIZE) {
    throw createError({
      status: 413,
      message: "File too large",
    });
  }

  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  const task = await getTaskById(id);

  if (!task) {
    throw createError({
      status: 404,
      message: "Task not found",
    });
  }

  // if (false === (await isUserWorkspaceCollaboratorForTask(user.id, task.id))) {
  //   throw createError({
  //     status: 403,
  //     message: "You are not authorized to access this task",
  //   });
  // }

  const { originalName } = await getValidatedQuery(
    event,
    z.object({
      originalName: z.string(),
    }).parseAsync,
  );

  const storage = useStorageS3(event);

  return db.transaction(async (tx): Promise<Attachment> => {
    const [attachment] = await tx
      .insert(attachments)
      .values({
        taskId: task.id,
        workspaceId: task.workspaceId,
        originalName,
      })
      .returning()
      .execute();

    const { url } = await storage.getPresignedUploadUrl({
      fileId: attachment.id,
      contentLength: parseInt(getHeader(event, "content-length")!),
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": contentLength.toString(),
      },
      body: getRequestWebStream(event),
      // @ts-expect-error For some reason, duplex is not in RequestInit type
      duplex: "half",
    });

    if (response.ok) {
      return attachment;
    } else {
      const text = await response.text();
      console.error("Failed to upload", text);
      throw createError({
        status: 500,
        message: "Failed to upload file",
      });
    }
  });
});

// The code below is the redirect approach. It sucks because S3 doesn't return
// any meaningful information about the uploaded file. Since the object key
// is generated by us, randomly, the file is lost forever. I'm also not
// convinced this approach wouldn't cost us ingress/egress fees.

// export default defineEventHandler(async (event) => {
//   const { user } = await requireUserSession(event);
//
//   // Reject large files before checking anything else
//   const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB
//   const contentLength = parseInt(getHeader(event, "content-length")!);
//   if (contentLength > MAX_FILE_SIZE) {
//     throw createError({
//       status: 413,
//       message: "File too large",
//     });
//   }
//
//   const { id } = await getValidatedRouterParams(
//     event,
//     validateId("id").parseAsync,
//   );
//
//   const task = await getTaskById(id);
//
//   if (!task) {
//     throw createError({
//       status: 404,
//       message: "Task not found",
//     });
//   }
//
//   if (false === (await isUserWorkspaceCollaboratorForTask(user.id, task.id))) {
//     throw createError({
//       status: 403,
//       message: "You are not authorized to access this task",
//     });
//   }
//
//   const { originalName } = await getValidatedQuery(
//     event,
//     z.object({
//       originalName: z.string(),
//     }).parseAsync,
//   );
//
//   const storage = useStorageS3(event);
//
//   const url = await storage.getPresignedUploadUrl({
//     workspaceId: task.workspaceId,
//     originalName,
//     taskId: task.id,
//     contentLength: parseInt(getHeader(event, "content-length")!),
//   });
//
//   return sendRedirect(event, url, 307);
// });
