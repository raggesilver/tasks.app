import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { H3Event } from "h3";
import type { Attachment } from "../db/schema";

/**
 * Encodes an attachment name to make it URL-safe and replaces encoded spaces
 * with actual spaces. Converts the given string into a URL-encoded string using
 * encodeURIComponent and then replaces occurrences of '%20' (URL-encoded space)
 * with a space character.
 *
 * @param name - The attachment name to be encoded.
 * @returns The encoded attachment name with spaces preserved.
 */
export const encodeAttachmentName = (name: string) =>
  encodeURIComponent(name).replace(/%20/g, " ");

/**
 * We generate the key with board and task ids as prefixes to make bulk
 * operations and cookie-based authorization easier.
 */
const getKeyForAttachment = (attachment: Attachment) =>
  `${attachment.boardId}/${attachment.taskId}/${attachment.id}`;

export const useStorageS3 = (event: H3Event) => {
  const client = event.context.$s3;

  if (!client) {
    throw new Error("S3 client not available");
  }

  const config = useRuntimeConfig();

  return {
    getKeyForAttachment,
    async getPresignedUploadUrl({ attachment }: { attachment: Attachment }) {
      return getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: getKeyForAttachment(attachment),
          ContentLength: attachment.size,
          ContentType: attachment.mimeType,
          ContentDisposition: `inline; filename*=UTF-8''${encodeAttachmentName(attachment.name)}`,
        }),
        { expiresIn: 3600 },
      ).then((url) => ({ url }));
    },
    async getPresignedDownloadUrl(
      attachment: Attachment,
      isAttachment = false,
    ) {
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: getKeyForAttachment(attachment),
          ResponseContentDisposition: `${isAttachment ? "attachment" : "inline"}; filename="${attachment.name}"`,
        }),
        { expiresIn: 3600 },
      );
    },
    async getBoardAccessCookie(boardId: string) {
      const cloudfront = event.context.$cloudfront;
      const { privateKey } = useRuntimeConfig().aws.signing;

      if (!cloudfront) {
        throw new Error("CloudFront client not available");
      }

      const policy = {
        Statement: [
          {
            Resource: `${config.AWS_ENDPOINT_URL_S3}/${config.BUCKET_NAME}/${boardId}/*`,
            Condition: {
              DateLessThan: {
                "AWS:EpochTime": Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
              },
            },
          },
        ],
      };

      return getSignedCookies({
        keyPairId: config.aws.signing.publicKeyId,
        privateKey,
        policy: JSON.stringify(policy),
      });
    },
    async deleteAttachments(attachments: Attachment[]): Promise<string[]> {
      const response = await client.send(
        new DeleteObjectsCommand({
          Bucket: config.bucketName,
          Delete: {
            Objects: attachments.map((file) => ({
              Key: getKeyForAttachment(file),
            })),
          },
        }),
      );

      return (
        response.Deleted?.map((d) => d.Key?.split("/").pop()).filter(
          (key) => key !== undefined,
        ) ?? []
      );
    },
  };
};

export type StorageAdapter = ReturnType<typeof useStorageS3>;
