declare module "#app" {
  interface PageMeta {
    breadcrumb?: {
      title: string;
      link: MaybeRefOrGetter<string>;
    };
  }
}

export {};
