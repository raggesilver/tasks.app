<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    workspaceId: string;
    /**
     * Whether to show the owner first in the list of collaborators.
     * @default true
     */
    ownerFirst?: boolean;
  }>(),
  {
    ownerFirst: true,
  },
);

const { data, isLoading, suspense } = useWorkspaceCollaborators(
  props.workspaceId,
);

if (import.meta.env.SSR) {
  await suspense();
}

const { user } = useUserSession();
const collaboratorsPotato = computed(() =>
  props.ownerFirst
    ? (data.value?.toSorted((a, b) =>
        a.id === user.value?.id ? 1 : b.id === user.value?.id ? 1 : 0,
      ) ?? [])
    : (data.value ?? []),
);

const collaborators = computed(() => {
  return collaboratorsPotato.value
    ? [
        collaboratorsPotato.value[0],
        collaboratorsPotato.value[0],
        collaboratorsPotato.value[0],
        collaboratorsPotato.value[0],
        collaboratorsPotato.value[1],
      ]
    : [];
});

const collapsedCollaborators = computed(() =>
  collaborators.value
    .slice(3)
    .map((collaborator) => collaborator.fullName)
    .join("\n"),
);
</script>

<template>
  <ul class="flex flex-row-reverse collaborators-avatars wrapper">
    <template v-if="isLoading">
      <li v-for="i in 3" :key="i" class="flex">
        <UniversalUserAvatar :user="null" class="avatar" />
      </li>
    </template>
    <template v-else>
      <li v-if="collaborators.length > 4" class="flex">
        <EasyTooltip :tooltip="collapsedCollaborators">
          <Avatar class="border border-foreground">
            <AvatarFallback class="select-none cursor-default">
              {{ collaborators.length - 3 }}+
            </AvatarFallback>
          </Avatar>
        </EasyTooltip>
      </li>
      <li
        v-for="collaborator of collaborators.slice(
          0,
          collaborators.length > 4 ? 2 : 3,
        )"
        :key="collaborator.id"
        class="flex"
      >
        <UniversalUserAvatar
          :user="collaborator"
          class="avatar border border-foreground"
        />
      </li>
      <li v-if="collaborators.length > 3" class="flex">
        <UniversalUserAvatar :user class="avatar border border-foreground" />
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
