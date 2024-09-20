<script setup lang="ts">
import { getInitials } from "~/lib/utils";
import type { User } from "~/server/db/schema";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  /**
   * The user to display. If `null`, a skeleton will be shown.
   */
  user: User | null;
}>();

const initials = computed(() =>
  props.user ? getInitials(props.user.fullName) : null,
);

const { user: currentUser } = useUserSession();

const tooltip = computed(() => {
  if (props.user?.id === currentUser.value?.id) return "You";
  return props.user?.fullName || "";
});
</script>

<template>
  <LazyEasyTooltip v-if="user" :tooltip>
    <Avatar v-bind="$attrs">
      <LazyAvatarImage
        v-if="user.profilePictureUrl"
        :src="user.profilePictureUrl"
      />
      <AvatarFallback>{{ initials }}</AvatarFallback>
    </Avatar>
  </LazyEasyTooltip>
  <LazySkeleton v-else class="rounded-full w-10 h-10" />
</template>
