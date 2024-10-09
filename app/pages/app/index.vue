<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

definePageMeta({
  layout: "app",
});

const { data, isPending, suspense } = useBoards();

// Block rendering until the data is fetched only in SSR. In the client, the
// `isPending` flag will be used to show a skeleton loader.
if (import.meta.env.SSR) {
  await suspense();
}
</script>

<template>
  <div class="flex-grow flex flex-col gap-8 p-8">
    <h1 class="text-3xl font-extrabold">Boards</h1>
    <div
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <template v-if="isPending">
        <Skeleton v-for="i in 3" :key="i" class="min-h-[100px] rounded-lg" />
      </template>
      <template v-else>
        <Card v-for="board in data" :key="board.id">
          <CardHeader
            ><CardTitle>{{ board.name }}</CardTitle></CardHeader
          >
          <CardContent>
            <nuxt-link :to="`/app/board/${board.id}`" class="text-sm">
              <span>Open Board</span>
            </nuxt-link>
          </CardContent>
        </Card>
      </template>
      <Card class="flex flex-col items-center justify-center p-4 border-dashed">
        <CreateBoard />
      </Card>
    </div>
  </div>
</template>
