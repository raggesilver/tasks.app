<script lang="ts" setup>
import { useMediaQuery } from "@vueuse/core";
import Form from "./form.vue";

const isOpen = defineModel<boolean>("isOpen", { default: false });

defineProps<{
  statusColumnId: string;
  boardId: string;
}>();

const isDesktop = useMediaQuery("(min-width: 640px)");

const title = "Create Task";
</script>

<template>
  <ClientOnly>
    <!-- Use a dialog on desktop -->
    <Dialog v-if="isDesktop" v-model:open="isOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ title }}</DialogTitle>
        </DialogHeader>
        <Form :board-id :status-column-id @dismiss="isOpen = false" />
      </DialogContent>
    </Dialog>
    <!-- And an iOS-like bottom sheet on mobile -->
    <Drawer v-else v-model:open="isOpen">
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>{{ title }}</DrawerTitle>
        </DrawerHeader>
        <Form :board-id :status-column-id @dismiss="isOpen = false" />
        <DrawerFooter class="pt-2">
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </ClientOnly>
</template>
