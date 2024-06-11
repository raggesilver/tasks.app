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

const { data: collaborators, suspense } = useWorkspaceCollaborators(
  props.workspaceId,
);

await suspense();

const getFullNameInitials = (fullName: string) =>
  fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2);
</script>

<template>
  <div class="flex flex-row items-center wrapper">
    <TooltipProvider
      v-if="collaborators?.length"
      v-for="(collaborator, i) of collaborators"
      :key="collaborator.id"
    >
      <Tooltip>
        <TooltipTrigger as-child>
          <Avatar
            class="avatar border border-foreground"
            :class="i === 0 && 'z-10'"
          >
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
  </div>
  <!-- TODO: render round Skeletons during loading -->
</template>

<style scoped>
.avatar:not(:first-child) {
  @apply -ml-2 transition-all;
}

.wrapper:hover .avatar:not(:first-child),
.wrapper:focus-within .avatar:not(:first-child) {
  @apply ml-1;
}
</style>
