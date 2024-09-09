<script setup lang="ts">
import { Badge } from "~/components/ui/badge";
import type { Label } from "~/server/db/schema";

defineProps<{
  label: Label;
}>();
</script>

<template>
  <Badge
    class="text-xs py-[1px] px-1 select-none"
    variant="outline"
    :style="`background-color: ${label.color}80; border-color: ${label.color};`"
  >
    <span class="font-normal text-foreground">{{ label.name }}</span>
  </Badge>
</template>
