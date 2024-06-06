<script lang="ts" setup>
import { useMediaQuery } from "@vueuse/core";
import Form from "./form.vue";

const isDesktop = useMediaQuery("(min-width: 768px)");

const isOpen = ref(false);

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
        <Form @dismiss="isOpen = false" />
      </DialogContent>
    </Dialog>
    <!-- And an iOS-like bottom sheet on mobile -->
    <Drawer v-else v-model:open="isOpen">
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription>{{ description }}</DrawerDescription>
        </DrawerHeader>
        <Form @dismiss="isOpen = false" />
        <DrawerFooter class="pt-2">
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </ClientOnly>

  <Button variant="outline" @click="isOpen = true">
    New Column <Icon name="lucide:plus" />
  </Button>
</template>
