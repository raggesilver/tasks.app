<script lang="ts" setup>
import type { FetchError } from "ofetch";
import AppLayout from "~/layouts/app.vue";
import { WORKSPACE_DATA_KEY } from "~/lib/injection-keys";

definePageMeta({
  // We need to access the NavBar's slot to add a button to it. While we could
  // do this using Teleports, Nuxt doesn't support SSR Teleports to anything
  // other than <body>. Instead, we'll disable the layout and re-implement it.
  layout: false,
});

const id = useRouteParamSafe("id") as Ref<string>;

const { data: workspace, error, suspense } = useWorkspace(id);
const { data: columns, suspense: statusSuspense } = useStatusColumns(id);
const { data: collaborators, suspense: collaboratorsSuspense } =
  useWorkspaceCollaborators(id);
const { data: labels, suspense: labelsSuspense } = useWorkspaceLabels(id);

if (import.meta.env.SSR) {
  await Promise.all([
    suspense(),
    statusSuspense(),
    collaboratorsSuspense(),
    labelsSuspense(),
  ]);
}

provide(WORKSPACE_DATA_KEY, {
  workspace,
  columns,
  collaborators,
  labels,
});

const route = useRoute();
const router = useRouter();
const { user } = useUserSession();

const viewTask = useRouteQuery("view-task") as Ref<string | null>;

const isSettingsMounted = computed(() =>
  route.matched.some((route) => route.name === "workspace-settings"),
);

const typedError = computed(
  () =>
    (error.value as FetchError | undefined)?.data as
      | { message: string; statusCode: number }
      | undefined,
);

const is404 = computed(() => typedError.value?.statusCode === 404);
const title = computed(() => workspace.value?.name ?? "Workspace");

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
            title: workspace?.name ?? 'Workspace',
            link: `/app/workspace/${id}`,
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
            title="Share workspace"
            :disabled="!workspace"
          >
            Share <Icon name="lucide:share" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" class="w-full sm:w-[435px]">
          <ShareWorkspace v-if="workspace" :workspace />
        </PopoverContent>
      </Popover>
      <EasyTooltip
        v-if="workspace?.ownerId === user?.id"
        tooltip="Workspace Settings"
      >
        <Button size="sm" variant="outline" class="w-8 p-0" as-child>
          <NuxtLink :to="`/app/workspace/${id}/settings`">
            <Icon name="lucide:ellipsis" />
          </NuxtLink>
        </Button>
      </EasyTooltip>
    </template>
    <div class="flex flex-col flex-grow px-8 gap-8 overflow-hidden">
      <template v-if="workspace">
        <div class="flex flex-row gap-4 items-center">
          <h1 class="text-3xl font-extrabold">{{ workspace.name }}</h1>
          <WorkspaceCollaboratorList :workspace-id="workspace.id" />
        </div>
        <TransitionGroup
          ref="boardRef"
          name="list"
          tag="ol"
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
        </TransitionGroup>
      </template>
      <template v-else-if="is404">
        <div class="flex-1 flex flex-col items-center justify-center">
          <h1 class="text-3xl font-extrabold">Workspace not found</h1>
          <Button variant="link" as-child>
            <NuxtLink to="/app">Go back</NuxtLink>
          </Button>
        </div>
      </template>
    </div>
    <Sheet
      :open="isSettingsMounted"
      @update:open="() => router.push(`/app/workspace/${id}`)"
    >
      <SheetContent :ssr="settingsSSR" as="aside" class="sm:max-w-lg">
        <NuxtPage />
      </SheetContent>
    </Sheet>
    <LazyTaskView v-if="viewTask" :task-id="viewTask" @close="onTaskClosed" />
  </AppLayout>
</template>
