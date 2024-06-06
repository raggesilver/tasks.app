<script setup lang="ts">
import type { StatusColumn } from "~/server/db/schema";

defineProps<{
  column: StatusColumn;
}>();

const showEditModal = ref(false);
</script>

<template>
  <Card class="w-xs flex-shrink-0">
    <CardHeader>
      <CardTitle class="flex flex-row items-center">
        <span class="flex-grow drag-handle">{{ column.name }}</span>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="w-8 h-8 p-0">
              <Icon name="lucide:ellipsis-vertical" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel class="pr-8">Column Actions</DropdownMenuLabel>
            <DropdownMenuItem @click="showEditModal = true">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Tasks</DropdownMenuLabel>
            <DropdownMenuItem disabled>Create Task</DropdownMenuItem>
            <DropdownMenuItem disabled>Archive All Tasks</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardTitle>
    </CardHeader>
  </Card>
  <EditColumn :column v-model:is-open="showEditModal" />
</template>
