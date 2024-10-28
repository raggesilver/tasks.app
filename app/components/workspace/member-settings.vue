<script lang="ts" setup>
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <SheetTitle>Member Settings</SheetTitle>
      <SheetDescription>
        Add or remove members from your workspace.
      </SheetDescription>
    </section>

    <div class="text-muted-foreground text-center">
      <ComingSoon />
    </div>
  </div>
</template>
