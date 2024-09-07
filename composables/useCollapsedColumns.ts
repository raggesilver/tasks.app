import { z } from "zod";

const schema = z.array(z.string().uuid());

type CollapsedColumns = z.infer<typeof schema>;

export const useCollapsedColumns = defineStore(
  "collapsed-columns-store",
  () => {
    const collapsedColumnsCookie =
      useCookie<CollapsedColumns>("collapsed-columns");

    const collapsedColumns = reactive(
      new Set(
        schema.safeParse(collapsedColumnsCookie.value).success
          ? collapsedColumnsCookie.value
          : [],
      ),
    );

    watch(
      collapsedColumns,
      () => {
        collapsedColumnsCookie.value = Array.from(collapsedColumns);
      },
      {
        immediate: true,
      },
    );

    return {
      collapsedColumns,
    };
  },
);
