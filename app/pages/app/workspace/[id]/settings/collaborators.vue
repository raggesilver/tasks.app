<script setup lang="ts">
import { WORKSPACE_DATA_KEY } from "~/lib/injection-keys";

const { workspace, collaborators } = inject(WORKSPACE_DATA_KEY)!;
</script>

<template>
  <EditCollaborators
    v-if="workspace && collaborators"
    :workspace
    :collaborators
  />
</template>
