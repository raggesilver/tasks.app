<script lang="ts" setup>
import { WORKSPACE_DEFINITION } from "~/lib/constants";

const tooltip = `${WORKSPACE_DEFINITION} Each workspace has its own plan and settings.`;
</script>

<template>
  <span v-once
    >Create a new
    <EasyTooltip :tooltip>
      <span
        class="underline decoration-dashed decoration-2 decoration-offset-4 cursor-help"
      >
        workspace</span
      >
    </EasyTooltip>
    to organize your projects.</span
  >
</template>
