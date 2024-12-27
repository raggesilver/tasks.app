<script lang="ts" setup>
import { toast } from "vue-sonner";
import type { Workspace } from "~~/server/db/schema";

const props = defineProps<{
  workspace: Workspace;
}>();

const {
  data: collaborators,
  isPending,
  suspense,
} = useWorkspaceCollaborators(() => props.workspace.id);

const {
  data: invitationLink,
  isPending: isInvitationLinkPending,
  suspense: invitationLinkSuspense,
} = useWorkspaceInvitationLink(() => props.workspace.id);

const { mutateAsync: createInvitationLink, isPending: isCreatingLink } =
  useCreateWorkspaceInvitationLinkMutation(() => props.workspace.id);

const { mutateAsync: disableInvitationLink, isPending: isDisablingLink } =
  useDeactivateWorkspaceInvitationLinkMutation(() => props.workspace.id);

if (import.meta.env.SSR) {
  await Promise.all([suspense(), invitationLinkSuspense()]);
}

const generateAndCopyLink = async (id: string) => {
  const _url = useRequestURL();

  const url = new URL("/api/invitation/accept", _url.origin);
  url.searchParams.set("token", id);

  return navigator.clipboard
    .writeText(url.toString())
    .then(() => toast.success("Link copied to clipboard."))
    .catch((err) => {
      console.error(err);
      toast.error("Failed to copy link to clipboard.");
    });
};

const onInviteWithLink = async () => {
  if (isCreatingLink.value) return;

  if (invitationLink.value) {
    // invitationLink.value.id
    await generateAndCopyLink(invitationLink.value.id);
    return;
  }

  const invitation = await createInvitationLink();
  console.log({ invitation });
  await generateAndCopyLink(invitation.id);
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

    <p>Invitation link: {{ JSON.stringify(invitationLink, null, 2) }}</p>

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
            Invite with link <LazyActivityIndicator v-if="isCreatingLink" />
            <Icon v-else name="lucide:link" class="ml-1" />
          </Button>
          <Button variant="secondary" @click="onDisableLink">
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
