import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { H3Event } from "h3";

export const useStorageS3 = (event: H3Event) => {
  const client = event.context.$s3;

  if (!client) {
    throw new Error("S3 client not available");
  }

  const config = useRuntimeConfig();

  return {
    async getPresignedUploadUrl({
      fileId,
      contentLength,
    }: {
      fileId: string;
      contentLength: number;
    }) {
      return getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: fileId,
          ContentLength: contentLength,
          ContentType: "application/octet-stream",
        }),
        { expiresIn: 3600 },
      ).then((url) => ({ url, fileId }));
    },
  };
};
