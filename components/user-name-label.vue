<script setup lang="ts">
import type { User } from "~/server/db/schema";

const props = defineProps<{
  userId: string;
}>();

const { data, isLoading } = useQuery({
  queryKey: ["public-user", props.userId],
  queryFn: (): Promise<User | null> =>
    // @ts-ignore
    useRequestFetch()(`/api/user/${props.userId}`),
});
</script>

<template>
  <template v-if="isLoading">
    <Skeleton
      class="h-[1em] w-12 inline-block"
      style="vertical-align: middle"
    />&nbsp;<Skeleton
      class="h-[1em] w-16 inline-block"
      style="vertical-align: middle"
    />
  </template>
  <span v-else>{{ data?.fullName || "Unknown User" }}</span>
</template>
