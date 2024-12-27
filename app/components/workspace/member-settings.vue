<script lang="ts" setup>
import { toast } from "vue-sonner";
import type { Workspace } from "~~/server/db/schema";

const props = defineProps<{
  workspace: Workspace;
}>();

const workspaceId = computed(() => props.workspace.id);

const {
  data: collaborators,
  isPending,
  suspense,
} = useWorkspaceCollaborators(workspaceId);

const {
  data: invitationLink,
  isPending: isInvitationLinkPending,
  suspense: invitationLinkSuspense,
} = useWorkspaceInvitationLink(workspaceId);

const { mutateAsync: createInvitationLink, isPending: isCreatingLink } =
  useCreateWorkspaceInvitationLinkMutation(workspaceId);

const { mutateAsync: disableInvitationLink, isPending: isDisablingLink } =
  useDeactivateWorkspaceInvitationLinkMutation(workspaceId);

if (import.meta.env.SSR) {
  await Promise.all([suspense(), invitationLinkSuspense()]);
}

const generateLink = async (id: string) => {
  const _url = useRequestURL();

  const url = new URL("/api/invitation/accept", _url.origin);
  url.searchParams.set("token", id);

  return url.toString();
};

const onInviteWithLink = async () => {
  if (isCreatingLink.value) return;

  // We need to use ClipboardItem with async content in order for this to work
  // in Safari. Otherwise, it will throw an error when we try writing to the
  // clipboard after awaiting for a promise.
  const item = new ClipboardItem({
    "text/plain": new Promise((resolve) => {
      if (invitationLink.value) {
        resolve(generateLink(invitationLink.value.id));
      } else {
        createInvitationLink()
          .then(({ id }) => resolve(generateLink(id)))
          .catch(() => toast.error("Failed to create invitation link."));
      }
    }),
  });

  await navigator.clipboard
    .write([item])
    .then(() => toast.success("Invitation link copied to clipboard."))
    .catch(() => toast.error("Failed to copy invitation link to clipboard."));
};

const onDisableLink = async () => {
  if (isDisablingLink.value || !invitationLink.value) return;

  await disableInvitationLink(invitationLink.value.id)
    .then(() => toast.success("Invitation link disabled."))
    .catch(() => toast.error("Failed to disable invitation link."));
};
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <SheetTitle class="flex items-center gap-2">
        Member Settings
        <LazyActivityIndicator v-if="isPending || isInvitationLinkPending" />
      </SheetTitle>
      <SheetDescription>
        Add or remove members from your workspace.
      </SheetDescription>
    </section>

    <section>
      <h3 class="font-semibold">Invite Collaborators</h3>
      <div class="flex flex-col md:flex-row gap-x-4 gap-y-2">
        <p class="text-sm text-muted-foreground md:w-2/3">
          Anyone with an invite link can join this free Workspace. You can also
          disable and create a new invite link for this Workspace at any time.
          Pending invitations count toward the 10 collaborator limit.
        </p>
        <div class="flex flex-col gap-2 flex-1">
          <Button @click="onInviteWithLink">
            {{ invitationLink === null ? "Invite with link" : "Copy link" }}
            <LazyActivityIndicator v-if="isCreatingLink" />
            <Icon
              v-else-if="invitationLink === null"
              name="lucide:link"
              class="ml-1"
            />
            <Icon v-else name="lucide:clipboard" class="ml-1" />
          </Button>
          <Button
            v-if="invitationLink"
            variant="secondary"
            @click="onDisableLink"
          >
            Disable link
            <LazyActivityIndicator v-if="isDisablingLink" />
          </Button>
        </div>
      </div>
    </section>

    <div v-if="!isPending">
      {{ collaborators }}
    </div>
  </div>
</template>
