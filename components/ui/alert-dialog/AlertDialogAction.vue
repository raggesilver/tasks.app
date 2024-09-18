<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { AlertDialogAction, type AlertDialogActionProps } from "radix-vue";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariants } from "@/components/ui/button";

const props = defineProps<
  AlertDialogActionProps & {
    class?: HTMLAttributes["class"];
    variant?: ButtonVariants["variant"];
  }
>();

const delegatedProps = computed(() => {
  const { class: _, variant: __, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <AlertDialogAction
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>
