<script lang="ts" setup>
import { useMediaQuery } from "@vueuse/core";
import Form from "./form.vue";
import type { StatusColumn } from "~/server/db/schema";

const isOpen = defineModel<boolean>("isOpen", { default: false });

defineProps<{
  column: StatusColumn;
}>();

const isDesktop = useMediaQuery("(min-width: 768px)");

const title = "Create Column";
const description = "Create a new status column to organize your tasks.";
</script>

<template>
  <ClientOnly>
    <!-- Use a dialog on desktop -->
    <Dialog v-if="isDesktop" v-model:open="isOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogDescription>{{ description }}</DialogDescription>
        </DialogHeader>
        <Form @dismiss="isOpen = false" :column />
      </DialogContent>
    </Dialog>
    <!-- And an iOS-like bottom sheet on mobile -->
    <Drawer v-else v-model:open="isOpen">
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription>{{ description }}</DrawerDescription>
        </DrawerHeader>
        <Form @dismiss="isOpen = false" :column />
        <DrawerFooter class="pt-2">
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </ClientOnly>
</template>
