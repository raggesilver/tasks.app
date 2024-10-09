<script setup lang="ts">
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import type { PublicUser } from "~/lib/validation";
import type { User } from "~~/server/db/schema";
import PopoverContent from "../ui/popover/PopoverContent.vue";
import PopoverTrigger from "../ui/popover/PopoverTrigger.vue";

const props = defineProps<{
  taskId: string;
  boardId: string;
}>();

const { data: collaborators, suspense } = useBoardCollaborators(props.boardId);
const { data: task, suspense: taskSuspense } = useTask(props.taskId);

// It is unlikely that we won't have the board's collaborators and task data
// already in cache, so awaiting for suspense here is fine.
await Promise.all([suspense(), taskSuspense()]);

const { mutateAsync: addAssignee } = useTaskAddAssigneeMutation();
const { mutateAsync: removeAssignee } = useTaskRemoveAssigneeMutation();

const toggleStatuses = reactive<{ [key: string]: boolean }>({});

const users = computed(() => {
  const assignedUsers: Record<string, boolean> = {};

  task.value?.assignees.forEach((a) => {
    assignedUsers[a.userId] = true;
  });

  return (
    collaborators.value?.map((c) => ({
      ...c,
      isAssigned: c.id in assignedUsers,
    })) ?? []
  );
});

const toggleUser = async (
  user: (User | PublicUser) & { isAssigned: boolean },
) => {
  if (toggleStatuses[user.id]) {
    return;
  }

  toggleStatuses[user.id] = true;

  const start = Date.now();
  try {
    await (user.isAssigned ? removeAssignee : addAssignee)({
      taskId: props.taskId,
      userId: user.id,
    });
  } finally {
    const end = Date.now();
    if (end - start < 500) {
      await new Promise((resolve) => setTimeout(resolve, 140 - (end - start)));
    }
    toggleStatuses[user.id] = false;
  }
};
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <slot>
        <Button variant="secondary" size="sm">Manage Assignees</Button>
      </slot>
    </PopoverTrigger>
    <PopoverContent class="p-0">
      <Command>
        <CommandInput placeholder="Search collaborators" />
        <CommandList>
          <CommandEmpty>No collaborators found.</CommandEmpty>
          <CommandItem
            v-for="user in users"
            :key="user.id"
            :value="`${user.fullName} (${user.id})`"
            :aria-label="
              user.isAssigned
                ? `Unassign ${user.fullName} from this task`
                : `Assign ${user.fullName} to this task`
            "
            @select="() => toggleUser(user)"
          >
            <UserAvatar :user-id="user.id" class="w-8 h-8 mr-2" />
            <span>{{ user.fullName }}</span>

            <div class="ml-auto">
              <Icon
                v-if="toggleStatuses[user.id]"
                name="lucide:loader-circle"
                class="w-4 h-4 animate-spin"
              />
              <Icon
                v-else-if="user.isAssigned"
                name="lucide:check"
                class="w-4 h-4 ml-auto"
              />
            </div>
          </CommandItem>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
