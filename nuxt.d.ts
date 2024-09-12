import type { Sentry } from "@sentry/node";

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
  }
}

export {};
