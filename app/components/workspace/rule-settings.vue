<script lang="ts" setup>
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();
</script>

<template>
  <div>
    <h3>Rule Settings</h3>
  </div>
</template>
