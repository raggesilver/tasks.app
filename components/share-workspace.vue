<script setup lang="ts">
import { toast } from "vue-sonner";
import type { Workspace } from "~/server/db/schema";

const props = defineProps<{
  workspace: Workspace;
}>();

const { user } = useUserSession();

const { activeInvitationLink, isLoading, createInvitationLink } =
  useWorkspaceInvitationLink(props.workspace.id);

const isOwner = computed(() => props.workspace.ownerId === user.value?.id);

const fullLink = computed(() => {
  const url = new URL(window.location.href);

  url.pathname = "/api/invitation/accept";
  url.searchParams.set("token", activeInvitationLink.value?.id ?? "");

  return url.toString();
});

const createLink = async () => {
  return createInvitationLink().catch((err) => {
    console.error(err);
    toast.error("Failed to create invitation link.");
  });
};

const copyLink = async () => {
  if (!activeInvitationLink.value) return;
  return navigator.clipboard
    .writeText(fullLink.value)
    .then(() => toast.success("Link copied to clipboard."))
    .catch(() => toast.error("Failed to copy link to clipboard."));
};
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="flex items-center justify-center py-8">
    <Icon name="lucide:loader-circle" class="animate-spin" />
  </div>
  <!-- User is owner -->
  <div v-else-if="isOwner" class="flex flex-col gap-2">
    <h1 class="text-lg font-bold">Share Workspace</h1>
    <div class="flex flex-col gap-2">
      <p>Share this workspace with others by sharing a link.</p>
      <p class="text-muted-foreground text-sm">
        Anyone with the link will be able to view and edit the workspace.
      </p>
      <Button
        v-if="!activeInvitationLink"
        class="w-full sm:w-auto sm:ml-auto"
        size="sm"
        @click="createLink"
      >
        Create Link
      </Button>
      <div v-else class="flex flex-row gap-2 items-center">
        <Input :default-value="fullLink" readonly autofocus />
        <Button size="sm" @click="copyLink">Copy Link</Button>
      </div>
    </div>
  </div>
  <!-- User is not owner -->
  <div v-else>
    <p class="text-sm text-muted-foreground text-center">
      Only workspace owners are allowed to invite collaborators.
    </p>
  </div>
</template>
