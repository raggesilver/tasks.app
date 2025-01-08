<script lang="ts" setup>
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <SheetTitle>Workspace Rules</SheetTitle>
      <SheetDescription>
        Control who can access and/or modify your workspace. Add board-level
        rules for fine-grained control.
      </SheetDescription>
    </section>

    <div class="text-muted-foreground text-center">
      <ComingSoon />
    </div>
  </div>
</template>
