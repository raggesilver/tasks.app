<script setup lang="ts">
import type { User } from "~/server/db/schema";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandList,
} from "~/components/ui/command";
import { getInitials } from "~/lib/utils";

const props = defineProps<{
  taskId: string;
  workspaceId: string;
}>();

const { data: collaborators, suspense } = useWorkspaceCollaborators(
  props.workspaceId,
);
const { data: task, suspense: taskSuspense } = useTask(props.taskId);

// It is unlikely that we won't have the workspace's collaborators and task data
// already in cache, so awaiting for suspense here is fine.
await Promise.all([suspense(), taskSuspense()]);

const { mutateAsync: addAssignee, isPending } = useTaskAddAssigneeMutation();
const { mutateAsync: removeAssignee, isPending: isRemovePending } =
  useTaskRemoveAssigneeMutation();

const collaboratorsMap = computed(
  () =>
    collaborators.value?.reduce(
      (acc, collaborator) => {
        acc[collaborator.id] = collaborator;
        return acc;
      },
      {} as Record<string, User>,
    ) ?? {},
);

const availableCollaborators = computed<User[]>(
  () =>
    collaborators.value?.filter(
      (collaborator) =>
        !task.value?.assignees.find(
          (assignee) => assignee.userId === collaborator.id,
        ),
    ) ?? [],
);

const onAddAssignee = async (value: string) => {
  if (isPending.value) {
    return;
  }

  await addAssignee({ taskId: props.taskId, userId: value });
};

const onRemoveAssignee = async (userId: string) => {
  if (isRemovePending.value) {
    return;
  }

  await removeAssignee({ taskId: props.taskId, userId });
};
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="secondary" size="sm">Manage Assignees</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Assignees</DialogTitle>
        <DialogDescription>
          Add or remove assignees from this task.
        </DialogDescription>
      </DialogHeader>

      <Command v-if="availableCollaborators.length > 0">
        <CommandInput placeholder="Search for collaborators" />
        <CommandList>
          <CommandEmpty>No collaborators found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="collaborator in availableCollaborators"
              :key="collaborator.id"
              :value="collaborator.fullName"
              @select="() => onAddAssignee(collaborator.id)"
            >
              <UserAvatar :user-id="collaborator.id" class="w-10 h-10 mr-2" />
              {{ collaborator.fullName }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <p v-else class="text-sm text-center my-4">
        All available collaborators on this workspace are already assigned to
        this task.
      </p>

      <Table class="w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Current Assignees</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="{ userId } of task?.assignees" :key="userId">
            <TableCell>
              <div class="flex items-center pl-2">
                <Avatar size="sm" class="mr-2 w-10 h-10">
                  <AvatarImage
                    v-if="collaboratorsMap[userId]?.profilePictureUrl"
                    :src="collaboratorsMap[userId]?.profilePictureUrl"
                  />
                  <AvatarFallback v-else>{{
                    getInitials(collaboratorsMap[userId]?.fullName)
                  }}</AvatarFallback>
                </Avatar>
                <span>{{ collaboratorsMap[userId]?.fullName }}</span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <Button
                variant="destructive"
                :aria-label="`Unassign ${collaboratorsMap[userId]?.fullName} from this task`"
                size="sm"
                @click="() => onRemoveAssignee(userId)"
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DialogContent>
  </Dialog>
</template>
