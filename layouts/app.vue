<template>
  <div class="flex flex-col min-h-screen bg-background">
    <NavBarNew>
      <template #left-items>
        <slot name="left-items" />
      </template>
      <template #right-items>
        <slot name="right-items" />
      </template>
    </NavBarNew>
    <slot />
    <AppFooter />
  </div>
</template>
