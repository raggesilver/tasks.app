<script lang="ts" setup>
import WorkspaceDescription from "./description.vue";
import Form from "./form.vue";

const isOpen = defineModel<boolean>("isOpen", { default: false });

const isDesktop = useMediaQuery("(min-width: 640px)");

const title = "Create Workspace";
const description = "Create a new workspace to organize your projects.";
</script>

<template>
  <ClientOnly>
    <!-- Use a dialog on desktop -->
    <Dialog v-if="isDesktop" v-model:open="isOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogDescription>
            <WorkspaceDescription />
          </DialogDescription>
        </DialogHeader>
        <Form @dismiss="isOpen = false" />
      </DialogContent>
    </Dialog>
    <!-- And an iOS-like bottom sheet on mobile -->
    <Drawer v-else v-model:open="isOpen">
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription>
            <WorkspaceDescription />
          </DrawerDescription>
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
</template>
