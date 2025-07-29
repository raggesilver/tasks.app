import { z } from "zod";
import { MAX_FILE_SIZE } from "~/lib/constants";
import { validateId } from "~/lib/validation";
import { attachmentService } from "~~/server/services/attachment";
import { isUserBoardCollaboratorForTask } from "~~/server/services/authorization";
import { _getBoardById } from "~~/server/services/board";
// import { isUserBoardCollaboratorForTask } from "~~/server/services/authorization";
import { getTaskById } from "~~/server/services/task";

// Our hosting platform does not charge ingress fees or egress fees to our S3
// bucket, so we can forward the upload request to S3, intercept the response,
// process it, and return whatever we want to the client. This might not be as
// fast as browser to S3 direct uploads, but it's a lot more flexible.
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
  const { user } = await requireUserSession(event);

  // Reject large files before checking anything else
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

  if (false === (await isUserBoardCollaboratorForTask(user.id, task.id))) {
    throw createError({
      status: 403,
      message: "You are not authorized to access this task",
    });
  }

  const { name, mimeType } = await getValidatedQuery(
    event,
    z.object({
      name: z.string().min(1),
      mimeType: z.string().min(1),
    }).parseAsync,
  );

  try {
    const storage = useStorageS3(event);
    const attachment = await attachmentService.uploadFile(
      storage,
      getRequestWebStream(event)!,
      { userId: user.id, task, name, mimeType, contentLength },
    );

    const board = await _getBoardById(task.boardId);
    if (board) {
      await invalidateCache("getUsageForWorkspace_" + board.workspaceId);
    }

    return attachment;
  } catch (e: unknown) {
    console.error("Failed to upload file", e);
    throw createError({
      status: 500,
      message: "Failed to upload file",
    });
  }
});
