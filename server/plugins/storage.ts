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

  console.log("S3 client initialized");

  nitro.hooks.hook("request", (event) => {
    console.log("Setting S3 client on event context");
    event.context.$s3 = client;
  });
});
