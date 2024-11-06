<script lang="ts" setup>
import { useMediaQuery } from "@vueuse/core";
import type { Workspace } from "~~/server/db/schema";
import Form from "./form.vue";

const props = defineProps<{
  workspace: Workspace;
}>();

const isDesktop = useMediaQuery("(min-width: 640px)");

const isOpen = ref(false);

const title = "Create a new board";
const description = computed(
  () => `Create a new board in the ${props.workspace.name} workspace.`,
);
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
        <Form :workspace @dismiss="isOpen = false" />
      </DialogContent>
    </Dialog>
    <!-- And an iOS-like bottom sheet on mobile -->
    <Drawer v-else v-model:open="isOpen">
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription>{{ description }}</DrawerDescription>
        </DrawerHeader>
        <Form :workspace @dismiss="isOpen = false" />
        <DrawerFooter class="pt-2">
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </ClientOnly>

  <Button
    variant="secondary"
    size="sm"
    class="flex items-center gap-2"
    @click="isOpen = true"
  >
    Create <Icon name="lucide:plus" />
  </Button>
</template>
