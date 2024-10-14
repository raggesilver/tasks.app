<script setup lang="ts">
import { BOARD_DATA_KEY } from "~/lib/injection-keys";

const { board, collaborators } = inject(BOARD_DATA_KEY)!;
</script>

<template>
  <EditCollaborators v-if="board && collaborators" :board :collaborators />
</template>
