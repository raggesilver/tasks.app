<script lang="ts" setup>
import type { FetchError } from "ofetch";
import AppLayout from "~/layouts/app.vue";
import { BOARD_DATA_KEY } from "~/lib/injection-keys";

definePageMeta({
  // We need to access the NavBar's slot to add a button to it. While we could
  // do this using Teleports, Nuxt doesn't support SSR Teleports to anything
  // other than <body>. Instead, we'll disable the layout and re-implement it.
  layout: false,
});

const id = useRouteParamSafe("id") as Ref<string>;

const {
  data: board,
  error,
  suspense,
  isPending: isBoardPending,
} = useBoard(id);

const {
  data: columns,
  suspense: statusSuspense,
  isPending: isStatusColumnPending,
} = useStatusColumns(id);

// FIXME: this is only being used via injection. I want to move away from this
// pattern and use a more explicit approach.
const { data: collaborators, suspense: collaboratorsSuspense } =
  useBoardCollaborators(id);
// FIXME: this is only being used via injection. I want to move away from this
// pattern and use a more explicit approach.
const { data: labels, suspense: labelsSuspense } = useBoardLabels(id);

if (import.meta.env.SSR) {
  await Promise.all([
    suspense(),
    statusSuspense(),
    collaboratorsSuspense(),
    labelsSuspense(),
  ]);
}

provide(BOARD_DATA_KEY, {
  board,
  columns,
  collaborators,
  labels,
});

const route = useRoute();
const router = useRouter();
const { user } = useUserSession();

const viewTask = useRouteQuery("view-task") as Ref<string | null>;

const isSettingsMounted = computed(() =>
  route.matched.some((route) => route.name === "board-settings"),
);

const typedError = computed(
  () =>
    (error.value as FetchError | undefined)?.data as
      | { message: string; statusCode: number }
      | undefined,
);

const is404 = computed(() => typedError.value?.statusCode === 404);
const title = computed(() => board.value?.name ?? "Board");

useHead({
  title,
});

const onTaskClosed = () => {
  router.push({ query: { ...route.query, "view-task": undefined } });
};

// TODO: this pattern we created is very useful, we should extract it to a hook
const settingsSSR = ref(true);
watch(
  isSettingsMounted,
  () => {
    if (isSettingsMounted.value === false) {
      settingsSSR.value = false;
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <AppLayout class="dark:bg-muted/40">
    <template #left-items>
      <AppBreadcrumbs
        :entries="[
          { title: 'Home', link: '/app' },
          {
            title: board?.name ?? 'Board',
            link: `/app/board/${id}`,
          },
        ]"
      />
    </template>
    <template #right-items>
      <Popover>
        <PopoverTrigger as-child>
          <Button
            size="sm"
            variant="outline"
            class="flex items-center gap-2"
            title="Share board"
            :disabled="!board"
          >
            Share <Icon name="lucide:share" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" class="w-full sm:w-[435px]">
          <LazyShareBoard v-if="board" :board />
        </PopoverContent>
      </Popover>
      <EasyTooltip v-if="board?.ownerId === user?.id" tooltip="Board Settings">
        <Button size="sm" variant="outline" class="w-8 p-0" as-child>
          <NuxtLink :to="`/app/board/${id}/settings`">
            <Icon name="lucide:ellipsis" />
          </NuxtLink>
        </Button>
      </EasyTooltip>
    </template>
    <div class="flex flex-col flex-grow px-8 gap-8 overflow-hidden">
      <template v-if="is404">
        <div class="flex-1 flex flex-col items-center justify-center">
          <h1 class="text-3xl font-extrabold">Board not found</h1>
          <Button variant="link" as-child>
            <NuxtLink to="/app">Go back</NuxtLink>
          </Button>
        </div>
      </template>
      <template v-else>
        <div class="flex flex-row gap-4 items-center">
          <h1 class="text-3xl font-extrabold flex items-center gap-2">
            <LazySkeleton
              v-if="isBoardPending"
              class="h-[1em] w-xs inline-block"
            />
            <span v-else>{{ board?.name }}</span>
          </h1>
          <BoardCollaboratorList :board-id="id" />
        </div>
        <template v-if="isStatusColumnPending || !columns">
          <ol
            class="flex flex-row flex-grow gap-8 items-start max-h-full -mx-8 px-8 pb-8 overflow-x-auto overflow-y-hidden"
          >
            <Skeleton
              v-for="i in 3"
              :key="i"
              class="shrink-0 w-xs h-full bg-muted dark:bg-background"
              as="li"
            />
            <li
              key="create-column"
              class="flex flex-col items-center justify-center p-8 border-2 rounded-lg border-dashed w-xs flex-shrink-0"
            >
              <CreateColumn />
            </li>
          </ol>
        </template>
        <ol
          v-else
          class="flex flex-row flex-grow gap-8 items-start max-h-full -mx-8 px-8 pb-8 overflow-x-auto overflow-y-hidden"
        >
          <StatusColumn
            v-for="column in columns"
            :key="column.id"
            :column
            class="shrink-0"
            as="li"
          />
          <li
            key="create-column"
            class="flex flex-col items-center justify-center p-8 border-2 rounded-lg border-dashed w-xs flex-shrink-0"
          >
            <CreateColumn />
          </li>
        </ol>
      </template>
    </div>
    <Sheet
      :open="isSettingsMounted"
      @update:open="() => router.push(`/app/board/${id}`)"
    >
      <SheetContent :ssr="settingsSSR" as="aside" class="sm:max-w-lg">
        <NuxtPage />
      </SheetContent>
    </Sheet>
    <LazyTaskView v-if="viewTask" :task-id="viewTask" @close="onTaskClosed" />
  </AppLayout>
</template>
