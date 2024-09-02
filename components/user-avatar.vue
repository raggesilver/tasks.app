<script lang="ts" setup>
import { getInitials } from "~/lib/utils";
import type { User } from "~/server/db/schema";

const props = defineProps<{
  userId: string;
}>();

const client = useQueryClient();
const { data, isPending, suspense } = useQuery<User>(
  {
    queryKey: ["user", props.userId],
    queryFn: async () => useRequestFetch()(`/api/user/${props.userId}`),
  },
  client,
);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <Skeleton v-if="isPending" class="rounded-full w-6 h-6" />
  <Avatar v-else>
    <AvatarImage v-if="data?.profilePictureUrl" :src="data.profilePictureUrl" />
    <AvatarFallback v-else>
      {{ data ? getInitials(data.fullName) : "" }}
    </AvatarFallback>
  </Avatar>
</template>
