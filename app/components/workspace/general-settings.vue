<script lang="ts" setup>
import EditWorkspaceForm from "~/components/workspace/edit-workspace-form.vue";
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();
</script>

<template>
  <div>
    <EditWorkspaceForm :workspace />
  </div>
</template>
