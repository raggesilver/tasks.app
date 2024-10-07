import { CreatePublicKeyCommand } from "@aws-sdk/client-cloudfront";

// NOTE: this route is unprotected, and is only available during development.
// I'm not sure if the version of nitro we're using supports environment
// specific routes, so we'll add a guard just in case.

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({
      message: "Not Found",
      statusCode: 404,
    });
  }

  const client = event.context.$cloudfront;

  if (!client) {
    throw new Error("S3 client not available");
  }

  let EncodedKey: string | null = null;
  try {
    EncodedKey = useRuntimeConfig().aws.signing.publicKey;
  } catch (e) {
    console.error("Enckey", e);
    throw "Failed to get public key";
  }

  const response = await client.send(
    new CreatePublicKeyCommand({
      PublicKeyConfig: {
        CallerReference: "tasksapp-public-key",
        Name: "tasksapp-public-key",
        EncodedKey,
      },
    }),
  );

  try {
    const PublicKey = response?.PublicKey?.Id;

    console.log({ publicKey: PublicKey });
  } catch (e) {
    console.error("Public key", e);
    throw "Failed to destructure public key";
  }

  return "ok";
});
