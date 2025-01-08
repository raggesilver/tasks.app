<script lang="ts" setup>
import { toast } from "vue-sonner";
import { usePublicUser } from "~/composables/usePublicUser";
import { useRemoveWorkspaceCollaborator } from "~/composables/useWorkspaceCollaborators";
import ActivityIndicator from "../activity-indicator.vue";

const props = defineProps<{
  userId: string;
  workspaceId: string;
}>();

const { user } = useUserSession();
const {
  data: collaborator,
  suspense,
  isPending,
} = usePublicUser(() => props.userId);

const { mutateAsync: removeCollaborator, isPending: isRemovingCollaborator } =
  useRemoveWorkspaceCollaborator();

if (import.meta.env.SSR) {
  await suspense();
}

const isSelf = computed(() => collaborator.value?.id === user.value?.id);

const onRemoveCollaborator = async () => {
  if (isRemovingCollaborator.value || !collaborator.value) return;

  try {
    const name = collaborator.value.fullName;
    await removeCollaborator({
      workspaceId: props.workspaceId,
      userId: props.userId,
    });
    toast.success(`Removed ${name} from workspace.`);
  } catch {
    toast.error("Failed to remove collaborator.");
  }
};

const isMenuOpen = ref(false);
</script>

<template>
  <div
    v-if="!isPending && collaborator"
    :class="{ 'menu-open': isMenuOpen }"
    class="flex flex-row gap-2 items-center [&:not(:hover):not(.menu-open)>button]:opacity-0 [&:hover,&.menu-open]:bg-foreground/03 dark:[&:hover,&.menu-open]:bg-foreground/05 transition-all p-2 rounded-lg cursor-default"
  >
    <UniversalUserAvatar :user="collaborator" />
    <div class="flex flex-col gap-0 5 items-start">
      <p class="font-semibold text-sm">
        {{ collaborator.fullName }}
        <span v-if="isSelf"> (You)</span>
      </p>
      <p class="text-xs text-muted-foreground">{{ collaborator.email }}</p>
    </div>
    <DropdownMenu v-if="!isSelf" v-model:open="isMenuOpen">
      <DropdownMenuTrigger as-child class="member-row-menu transition-all">
        <Button class="w-6 h-6 p-0 ml-auto flex-shrink-0" variant="outline">
          <ActivityIndicator v-if="isRemovingCollaborator" />
          <Icon v-else name="lucide:ellipsis" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        class="grid grid-cols-[min-content_auto_min-content] gap-x-2"
      >
        <DropdownMenuItem
          class="text-red-500 grid grid-cols-subgrid col-span-full"
          @click="onRemoveCollaborator"
        >
          <Icon name="lucide:trash" />
          Remove Collaborator
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
