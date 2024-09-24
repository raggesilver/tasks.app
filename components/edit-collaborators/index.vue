<script setup lang="ts">
import { toast } from "vue-sonner";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getInitials } from "~/lib/utils";
import type { PublicUser } from "~/lib/validation";
import type { User, Workspace } from "~/server/db/schema";

const props = defineProps<{
  workspace: Workspace;
  collaborators: (User | PublicUser)[];
}>();

const { user: self } = useUserSession();

// A list of collaborators that are not the current user. We don't want to allow
// the current user to remove themselves from the workspace.
const nonSelfCollaborators = computed(() =>
  props.collaborators.filter(
    (collaborator) => collaborator.id !== self.value?.id,
  ),
);

const { mutateAsync, status: mutationStatus } =
  useRemoveWorkspaceCollaborator();

const onRemoveCollaborator = (collaborator: User | PublicUser) => {
  // Remove collaborator from workspace
  if (mutationStatus.value === "pending") {
    return;
  }

  mutateAsync({ workspaceId: props.workspace.id, userId: collaborator.id })
    .then(() => {
      toast.success(
        `${collaborator.fullName} has been removed from the workspace.`,
      );
    })
    .catch((error) => {
      toast.error(
        `Failed to remove ${collaborator.fullName} from the workspace.`,
      );
      console.error(error);
    });
};
</script>

<template>
  <div>
    <SheetHeader>
      <SheetTitle>Manage Collaborators</SheetTitle>
      <SheetDescription>
        Add or remove collaborators to the {{ workspace.name }} workspace.
      </SheetDescription>
    </SheetHeader>

    <!-- content -->

    <div class="my-4">
      <span
        v-if="nonSelfCollaborators.length === 0"
        class="block text-center text-sm"
      >
        There are no collaborators on this workspace besides you.
      </span>

      <Table v-else class="w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user of nonSelfCollaborators" :key="user.id">
            <TableCell>
              <div class="flex items-center">
                <Avatar size="sm" class="mr-2">
                  <AvatarImage
                    v-if="user.profilePictureUrl"
                    :src="user.profilePictureUrl"
                  />
                  <AvatarFallback v-else>{{
                    getInitials(user.fullName)
                  }}</AvatarFallback>
                </Avatar>
                <span>{{ user.fullName }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Button
                type="submit"
                variant="destructive"
                :aria-label="`Remove ${user.fullName} from the workspace`"
                size="sm"
                @click="() => onRemoveCollaborator(user)"
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
