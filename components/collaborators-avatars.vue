<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "~/components/ui/tooltip";

const props = defineProps<{
  workspaceId: string;
}>();

const { user } = useUserSession();

const { data: collaborators, suspense } = useWorkspaceCollaborators(
  props.workspaceId,
);

await suspense();

const sortedCollaborators = computed(
  () =>
    // Move the current user to the front of the list. Everthing else is untouched.
    collaborators.value?.toSorted((a, b) =>
      a.id === user.value?.id ? -1 : b.id === user.value?.id ? 1 : 0,
    ) ?? [],
);

const getFullNameInitials = (fullName: string) =>
  fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2);
</script>

<template>
  <ul
    v-if="collaborators?.length"
    class="flex flex-row items-center collaborators-avatars wrapper"
  >
    <li
      v-for="collaborator of sortedCollaborators"
      :key="collaborator.id"
      class="flex"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Avatar class="avatar border border-foreground">
              <AvatarImage
                v-if="collaborator.profilePictureUrl"
                :src="collaborator.profilePictureUrl"
              />
              <AvatarFallback>{{
                getFullNameInitials(collaborator.fullName)
              }}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{{ collaborator.fullName }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  </ul>
</template>

<style>
.collaborators-avatars.wrapper li:first-child {
  @apply z-10;
}

.collaborators-avatars.wrapper li:not(:first-child) .avatar {
  @apply -ml-2 transition-all;
}

.collaborators-avatars.wrapper:hover li:not(:first-child) .avatar,
.collaborators-avatars.wrapper:focus-within li:not(:first-child) .avatar {
  @apply ml-1;
}
</style>
