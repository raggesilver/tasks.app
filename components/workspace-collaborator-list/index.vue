<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    workspaceId: string;
    /**
     * Whether to show the owner first in the list of collaborators. Nothing
     * will change if the owner is not a collaborator.
     *
     * @default true
     */
    ownerFirst?: boolean;
    /**
     * If provided, the list will render at most `limit` collaborators. If
     * there are more than `limit` collaborators, the `limit`-th element on the
     * list will be a placeholder for the number of remaining collaborators.
     *
     * If this number is less than 1, the list will render all collaborators.
     *
     */
    limit?: number;
  }>(),
  {
    ownerFirst: true,
    limit: 5,
  },
);

const { data, isPending, suspense } = useWorkspaceCollaborators(
  props.workspaceId,
);

if (import.meta.env.SSR) {
  await suspense();
}

const { user } = useUserSession();

const shouldLimit = computed(
  () => data.value && props.limit > 1 && data.value.length > props.limit,
);

const collaborators = computed(() => {
  if (!data.value) return [];
  if (!props.ownerFirst) return data.value;

  const owner = data.value.find(
    (collaborator) => collaborator.id === user.value?.id,
  );

  const withoutOwner = data.value.filter(
    (collaborator) => collaborator.id !== user.value?.id,
  );

  const index = shouldLimit.value ? props.limit - 2 : withoutOwner.length;

  withoutOwner.splice(index, 0, owner!);

  return withoutOwner;
});

const collapsedCollaboratorsText = computed(() =>
  shouldLimit.value
    ? collaborators.value
        .slice(props.limit - 1)
        .map((collaborator) => collaborator.fullName)
        .join("\n")
    : "",
);
</script>

<template>
  <ul class="flex flex-row-reverse collaborators-avatars wrapper">
    <template v-if="isPending">
      <li v-for="i in 3" :key="i" class="flex">
        <UniversalUserAvatar
          :user="null"
          class="avatar"
          :data-testid="`mock-user-avatar-${i}`"
        />
      </li>
    </template>
    <template v-else>
      <li v-if="shouldLimit" class="flex">
        <EasyTooltip :tooltip="collapsedCollaboratorsText">
          <Avatar
            class="border border-foreground"
            data-testid="collapsed-users-avatar"
          >
            <AvatarFallback class="select-none cursor-default">
              {{ collaborators.length - limit + 1 }}+
            </AvatarFallback>
          </Avatar>
        </EasyTooltip>
      </li>
      <li
        v-for="collaborator of shouldLimit
          ? collaborators.slice(0, limit - 1)
          : collaborators"
        :key="collaborator.id"
        class="flex"
      >
        <UniversalUserAvatar
          :user="collaborator"
          class="avatar border border-foreground"
          :data-testid="`user-avatar-${collaborator.id}`"
        />
      </li>
    </template>
  </ul>
</template>

<style>
.collaborators-avatars.wrapper li:not(:last-child) > * {
  @apply -ml-3 transition-all;
}

.collaborators-avatars.wrapper:hover li:not(:last-child) > *,
.collaborators-avatars.wrapper:focus-within li:not(:last-child) > * {
  @apply ml-1;
}
</style>
