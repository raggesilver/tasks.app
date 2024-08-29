<script setup lang="ts">
import { DotsHorizontalIcon } from "@radix-icons/vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { User } from "~/server/db/schema";

defineProps<{
  users: User[];
  isOwner: boolean;
}>();

const emit = defineEmits<{
  manageCollaborators: [];
}>();

const { user } = useUserSession();

const getFullNameInitials = (fullName: string) =>
  fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2);
</script>

<template>
  <ul class="flex flex-row items-center collaborators-avatars wrapper">
    <li v-for="collaborator of users" :key="collaborator.id" class="flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Avatar class="avatar border border-foreground">
              <AvatarImage
                v-if="collaborator.profilePictureUrl"
                :src="collaborator.profilePictureUrl"
                :alt="`${collaborator.fullName}'s profile picture`"
              />
              <AvatarFallback>{{
                getFullNameInitials(collaborator.fullName)
              }}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              {{ collaborator.fullName
              }}{{ collaborator.id === user?.id ? " (you)" : "" }}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
    <li v-if="isOwner" class="flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              @click="() => emit('manageCollaborators')"
            >
              <DotsHorizontalIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Manage collaborators</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  </ul>
</template>

<style>
.collaborators-avatars.wrapper li:first-child {
  @apply z-10;
}

.collaborators-avatars.wrapper li:not(:first-child) > * {
  @apply -ml-2 transition-all;
}

.collaborators-avatars.wrapper li:not(:first-child) > button {
  @apply opacity-0 invisible;
}

.collaborators-avatars.wrapper:hover li:not(:first-child) > *,
.collaborators-avatars.wrapper:focus-within li:not(:first-child) > * {
  @apply ml-1 opacity-100 visible;

  &:is(button) {
    @apply ml-2;
  }
}
</style>
