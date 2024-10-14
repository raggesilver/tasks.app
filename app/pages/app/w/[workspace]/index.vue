<script lang="ts" setup>
import type { FetchError } from "ofetch";
import AppLayout from "~/layouts/app.vue";

definePageMeta({
  // We need to access the NavBar's slot to add a button to it. While we could
  // do this using Teleports, Nuxt doesn't support SSR Teleports to anything
  // other than <body>. Instead, we'll disable the layout and re-implement it.
  layout: false,
});

const route = useRoute();
const router = useRouter();

const id = useRouteParamSafe("workspace");
const {
  data: workspace,
  suspense,
  error,
  isPending,
} = useWorkspace(() => id.value.toString());

const {
  data: boards,
  suspense: boardsSuspense,
  isPending: areBoardsPending,
} = useBoards();

const { user } = useUserSession();

if (import.meta.env.SSR) {
  await Promise.all([suspense(), boardsSuspense()]);
}

const typedError = computed(
  () =>
    (error.value as FetchError | undefined)?.data as
      | { message: string; statusCode: number }
      | undefined,
);

const is404 = computed(() => typedError.value?.statusCode === 404);
const title = computed(
  () => workspace.value?.name ?? (is404.value ? "404" : "Workspace"),
);

const filteredBoards = computed(
  () =>
    boards.value?.filter(
      (board) => board.workspaceId === id.value.toString(),
    ) ?? [],
);

useHead({
  title,
});

const showSettings = computed({
  get: () => "settings" in route.query,
  set: (value: boolean) => {
    router.push({
      query: { ...route.query, settings: value ? "" : undefined },
    });
  },
});

const mountSheetSSR = useSSRSheetHelper(showSettings);
</script>

<template>
  <AppLayout class="dark:bg-muted/40">
    <template #left-items>
      <AppBreadcrumbs
        :entries="[
          { title: 'Home', link: '/app' },
          {
            title: workspace?.name ?? 'Workspace',
            link: `/app/w/${id}`,
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
            :disabled="!workspace"
          >
            Share <Icon name="lucide:share" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" class="w-full sm:w-[435px]">
          <!-- <LazyShareBoard v-if="board" :board /> -->
        </PopoverContent>
      </Popover>
      <EasyTooltip
        v-if="workspace?.ownerId === user?.id"
        tooltip="Workspace Settings"
      >
        <Button size="sm" variant="outline" class="w-8 p-0" as-child>
          <NuxtLink :to="{ query: { ...route.query, settings: '' } }">
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
        <div>
          <h1 class="text-3xl font-extrabold flex items-center gap-2">
            <LazySkeleton v-if="isPending" class="h-[1em] w-xs inline-block" />
            <span v-else>{{ workspace?.name }}</span>
          </h1>
          <p>Here are all the boards in the {{ workspace?.name }} workspace.</p>
        </div>
        <ol v-if="isPending || areBoardsPending" class="standard-grid">
          <Skeleton
            v-for="i in 3"
            :key="i"
            class="shrink-0 h-[100px] bg-muted dark:bg-background"
            as="li"
          />
        </ol>
        <ol v-else class="standard-grid">
          <li v-for="board in filteredBoards" :key="board.id">
            <Card>
              <CardHeader>
                <CardTitle>{{ board.name }}</CardTitle>
              </CardHeader>
              <CardContent>
                <NuxtLink :to="`/app/b/${board.id}`" class="text-sm">
                  <span>Open Board</span>
                </NuxtLink>
              </CardContent>
            </Card>
          </li>
          <li
            key="create-column"
            class="flex flex-col items-center justify-center p-8 border-2 rounded-lg border-dashed"
          >
            <CreateBoard v-if="workspace" :workspace />
          </li>
        </ol>
      </template>
    </div>
    <Sheet v-model:open="showSettings">
      <SheetContent
        :ssr="mountSheetSSR"
        class="w-[100vw] sm:w[75vw] lg:w-[50vw] !max-w-[100vh] overflow-y-auto"
        as="aside"
      >
        <WorkspaceSettings v-if="workspace" :workspace />
      </SheetContent>
    </Sheet>
  </AppLayout>
</template>
