import { eq } from "drizzle-orm";
import { type Attachment, attachments, type Task } from "~~/server/db/schema";
import type { StorageAdapter } from "~~/server/utils/storage";
import { db } from "../db/db";

class AttachmentService {
  async uploadFile(
    storage: StorageAdapter,
    stream: ReadableStream,
    data: {
      userId: string;
      task: Task;
      name: string;
      mimeType: string;
      contentLength: number;
    },
  ): Promise<Attachment> {
    return db.transaction(async (tx) => {
      const [attachment] = await tx
        .insert(attachments)
        .values({
          taskId: data.task.id,
          boardId: data.task.boardId,
          name: data.name,
          mimeType: data.mimeType,
          size: data.contentLength,
          uploadedBy: data.userId,
        })
        .returning()
        .execute();

      const { url } = await storage.getPresignedUploadUrl({
        attachment,
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": data.mimeType,
          "Content-Length": data.contentLength.toString(),
          "Content-Disposition": `inline; filename="${data.name}"`,
        },
        body: stream,
        // @ts-expect-error For some reason, duplex is not in RequestInit type
        duplex: "half",
      });

      if (!response.ok) {
        throw new Error("Failed to upload attachment", { cause: response });
      }

      return attachment;
    });
  }

  async deleteAttachments(storage: StorageAdapter, _attachments: Attachment[]) {
    // TODO: we may be able to improve this function by batch deleting stuff
    // from S3 and then deleting the rows from the database. Currently, we don't
    // do that because I'm afraid of what happens if some files are deleted and
    // others are not. This can get particularly nasty if we delete something
    // from S3 but not from the database, because then we will keep trying to
    // delete a file that no longer exists.
    //
    // The current approach deletes files one by one from S3 and only then
    // deletes the row from the database.
    return Promise.all(
      _attachments.map(async (attachment) => {
        // FIXME: This might return false, which means we didn't actually delete
        // the attachment from S3.
        await storage.deleteAttachments([attachment]);
        await db
          .delete(attachments)
          .where(eq(attachments.id, attachment.id))
          .execute();
        return true;
      }),
    ).then((results) => results.every(Boolean));
  }
}

export const attachmentService = new AttachmentService();
