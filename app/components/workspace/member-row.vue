<script lang="ts" setup>
import { usePublicUser } from "~/composables/usePublicUser";

const props = defineProps<{
  userId: string;
}>();

const { user } = useUserSession();
const {
  data: collaborator,
  suspense,
  isPending,
} = usePublicUser(() => props.userId);

if (import.meta.env.SSR) {
  await suspense();
}

const isSelf = computed(() => collaborator.value?.id === user.value?.id);

const removeCollaborator = async () => {
  alert("Not implemented yet.");
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
          <Icon name="lucide:ellipsis" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        class="grid grid-cols-[min-content_auto_min-content] gap-x-2"
      >
        <DropdownMenuItem
          class="text-red-500 grid grid-cols-subgrid col-span-full"
          @click="removeCollaborator"
        >
          <Icon name="lucide:trash" /> Remove Collaborator
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
