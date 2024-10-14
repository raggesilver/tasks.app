<script lang="ts" setup>
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();
</script>

<template>
  <div class="space-y-8">
    <section>
      <SheetTitle>Workspace Settings</SheetTitle>
      <SheetDescription
        >Customize rules, permissions, members, and much more for your entire
        workspace.</SheetDescription
      >
    </section>

    <div>
      <p>Workspace settings coming soon.</p>
    </div>
  </div>
</template>
