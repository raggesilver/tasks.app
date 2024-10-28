<script lang="ts" setup>
import EditWorkspaceForm from "~/components/workspace/edit-workspace-form.vue";
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <SheetTitle>General Settings</SheetTitle>
      <SheetDescription>
        Modify general settings for your workspace.
      </SheetDescription>
    </section>
    <EditWorkspaceForm :workspace />
  </div>
</template>
