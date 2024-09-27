import { S3Client } from "@aws-sdk/client-s3";

export default defineNitroPlugin((nitro) => {
  const config = useRuntimeConfig();
  const client = new S3Client({
    region: config.aws.region,
    endpoint: config.aws.endpointUrlS3,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });

  nitro.hooks.hook("request", (event) => {
    event.context.$s3 = client;
  });
});
