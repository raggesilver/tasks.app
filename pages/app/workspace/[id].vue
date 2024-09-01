<script lang="ts" setup>
import type { FetchError } from "ofetch";

definePageMeta({
  // We need to access the NavBar's slot to add a button to it. While we could
  // do this using Teleports, Nuxt doesn't support SSR Teleports to anything
  // other than <body>. Instead, we'll disable the layout and re-implement it.
  layout: false,
});

const route = useRoute();
const router = useRouter();
const { user } = useUserSession();

const id = computed(() => route.params.id.toString());
const viewTask = computed<string | null>(
  () => route.query["view-task"]?.toString() ?? null,
);

const { data: workspace, error, suspense } = useWorkspace(id);
const { data: columns, suspense: statusSuspense } = useStatusColumns(id);
const { data: collaborators, suspense: collaboratorsSuspense } =
  useWorkspaceCollaborators(id);

await Promise.all([suspense(), statusSuspense(), collaboratorsSuspense()]);

const typedError = computed(
  () =>
    (error.value as FetchError | undefined)?.data as
      | { message: string; statusCode: number }
      | undefined,
);

const collaboratorsSorted = computed(
  () =>
    collaborators.value?.toSorted((a, b) =>
      a.id === user.value?.id ? -1 : b.id === user.value?.id ? 1 : 0,
    ) ?? [],
);

const is404 = computed(() => typedError.value?.statusCode === 404);

const title = computed(() => workspace.value?.name ?? "Workspace");

useHead({
  title,
});

const showManageCollaborators = ref(false);

const onTaskClosed = () => {
  router.push({ query: { ...route.query, "view-task": undefined } });
};
</script>

<template>
  <!-- start of app layout re-implementation -->
  <div class="flex flex-col h-screen bg-background">
    <NavBar>
      <template #right-items v-if="workspace">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              size="sm"
              variant="outline"
              class="flex items-center gap-2"
              title="Share workspace"
            >
              Share <Icon name="lucide:share" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" class="w-full sm:w-[435px]">
            <ShareWorkspace :workspace />
          </PopoverContent>
        </Popover>
      </template>
    </NavBar>
    <!-- actual content of this page -->
    <div
      class="flex flex-col flex-grow px-8 pt-8 gap-8 dark:bg-muted/40 overflow-hidden"
    >
      <template v-if="workspace">
        <div class="flex flex-row gap-4 items-center">
          <h1 class="text-3xl font-extrabold">{{ workspace.name }}</h1>
          <AvatarsList
            :users="collaboratorsSorted"
            :isOwner="workspace.ownerId === user?.id"
            aria-label="List of workspace collaborators"
            @manage-collaborators="showManageCollaborators = true"
          />
        </div>
        <TransitionGroup
          name="list"
          tag="ol"
          v-if="columns?.length"
          class="flex flex-row gap-8 items-start max-h-full -mx-8 px-8 pb-8 overflow-x-auto overflow-y-hidden"
          ref="boardRef"
        >
          <StatusColumn
            v-for="column in columns"
            :key="column.id"
            :column
            class="shrink-0"
            as="li"
          />
          <li
            class="flex flex-col items-center justify-center p-8 border-2 rounded-lg border-dashed w-xs flex-shrink-0"
            key="create-column"
          >
            <CreateColumn />
          </li>
        </TransitionGroup>
      </template>
      <template v-else-if="is404" class="">
        <div class="flex-1 flex flex-col items-center justify-center">
          <h1 class="text-3xl font-extrabold">Workspace not found</h1>
          <Button variant="link" as-child>
            <NuxtLink to="/app">Go back</NuxtLink>
          </Button>
        </div>
      </template>
    </div>
    <!-- end of actual content of this page -->
    <AppFooter />
    <!-- end of app layout re-implementation -->
  </div>
  <TaskView v-if="viewTask" :taskId="viewTask" @close="onTaskClosed" />
  <EditCollaborators
    v-if="workspace && collaborators"
    v-bind="{ workspace, collaborators }"
    v-model="showManageCollaborators"
  />
</template>
