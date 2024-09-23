<script setup lang="ts">
import { getInitials } from "~/lib/utils";
import type { User } from "~/server/db/schema";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  | {
      /**
       * The user to display. If `null`, a skeleton will be shown.
       */
      user: User | null;
      userId?: never;
    }
  | {
      user?: never;
      userId: string;
    }
>();

const { data, isPending, suspense } = useQuery<User>({
  queryKey: ["user", props.userId],
  queryFn: async () => useRequestFetch()<User>(`/api/user/${props.userId!}`),
  enabled: () => !!props.userId,
});

if (import.meta.env.SSR && props.userId) {
  await suspense();
}

const isReallyPending = computed(() => isPending.value && !props.user);

const resolvedUser = computed<User | null | undefined>(() =>
  "user" in props ? props.user : data.value,
);

const initials = computed(() =>
  resolvedUser.value ? getInitials(resolvedUser.value.fullName) : null,
);

const { user: currentUser } = useUserSession();

const tooltip = computed(() => {
  if (resolvedUser.value?.id === currentUser.value?.id) return "You";
  return resolvedUser.value?.fullName || "";
});
</script>

<template>
  <LazySkeleton
    v-if="isReallyPending || !resolvedUser"
    class="rounded-full w-10 h-10"
  />
  <LazyEasyTooltip v-else :tooltip>
    <Avatar v-bind="$attrs">
      <LazyAvatarImage
        v-if="resolvedUser.profilePictureUrl"
        :src="resolvedUser.profilePictureUrl"
      />
      <AvatarFallback>{{ initials }}</AvatarFallback>
    </Avatar>
  </LazyEasyTooltip>
</template>
