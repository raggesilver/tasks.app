import type { S3Client } from "@aws-sdk/client-s3";
import type Sentry from "@sentry/node";

declare module "#app" {
  interface PageMeta {
    breadcrumb?: {
      title: string;
      link: MaybeRefOrGetter<string>;
    };
  }
}

declare module "h3" {
  interface H3EventContext {
    $sentry?: Sentry;
    $s3?: S3Client;
  }
}

export {};
