<script lang="ts" setup>
import AppLayout from "~/layouts/app.vue";

definePageMeta({
  layout: false,
});

const {
  data: workspaces,
  isPending: areWorkspacesPending,
  suspense: workspacesSuspense,
} = useWorkspaces();
// const { data, isPending, suspense } = useBoards();

// Block rendering until the data is fetched only in SSR. In the client, the
// `isPending` flag will be used to show a skeleton loader.
if (import.meta.env.SSR) {
  // await suspense();
  await workspacesSuspense();
  // TODO: we need to create an API to favorite boards so we can show favorite
  // boards in the front page (as opposed to just workspace or all boards)
}

const showCreateWorkspace = ref(false);
</script>

<template>
  <AppLayout class="dark:bg-muted/40">
    <template #left-items>
      <AppBreadcrumbs :entries="[{ title: 'Home', link: '/app' }]" />
    </template>
    <div class="flex-grow flex flex-col gap-8 px-8">
      <h1 class="text-3xl font-extrabold">Your Workspaces</h1>
      <div class="standard-grid auto-rows-fr">
        <template v-if="areWorkspacesPending">
          <Skeleton v-for="i in 3" :key="i" class="min-h-[100px] rounded-lg" />
        </template>
        <template v-else>
          <Card v-for="workspace in workspaces" :key="workspace.id">
            <CardHeader>
              <CardTitle>{{ workspace.name }}</CardTitle>
            </CardHeader>
            <CardContent>
              <NuxtLink :to="`/app/w/${workspace.id}`" class="text-sm">
                Open Workspace
              </NuxtLink>
            </CardContent>
          </Card>
        </template>
        <Card
          class="flex flex-col items-center justify-center p-4 border-2 border-dashed bg-transparent"
        >
          <Button
            size="sm"
            variant="ghost"
            @click="() => (showCreateWorkspace = true)"
          >
            Create
            <Icon class="h-[1.2em] ml-1" name="lucide:plus" />
          </Button>
        </Card>
      </div>

      <CreateWorkspace v-model:is-open="showCreateWorkspace" />
    </div>
  </AppLayout>
</template>
