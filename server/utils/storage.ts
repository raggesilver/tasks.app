import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { H3Event } from "h3";
import type { Attachment } from "../db/schema";

export const useStorageS3 = (event: H3Event) => {
  const client = event.context.$s3;

  if (!client) {
    throw new Error("S3 client not available");
  }

  const config = useRuntimeConfig();

  return {
    async getPresignedUploadUrl({ attachment }: { attachment: Attachment }) {
      return getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: attachment.id,
          ContentLength: attachment.size,
          ContentType: attachment.mimeType,
          ContentDisposition: `inline; filename="${attachment.name}"`,
        }),
        { expiresIn: 3600 },
      ).then((url) => ({ url }));
    },
    async getPresignedDownloadUrl(attachment: Attachment) {
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: attachment.id,
        }),
        { expiresIn: 3600 },
      );
    },
  };
};
