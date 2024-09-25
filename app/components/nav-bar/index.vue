<template>
  <nav class="border-b px-8 py-2">
    <div class="flex flex-row items-center gap-4">
      <nuxt-link class="text-xl font-bold" to="/app">
        <Icon name="lucide:check" class="h-6 w-6" />
        Tasks.app
      </nuxt-link>
      <CreateWorkspace />
      <span aria-hidden="true" class="mx-auto" />
      <!-- This div is used as a target for component teleports -->
      <div
        id="nav-bar-right-items"
        class="flex flex-row gap-inherit items-inherit"
      >
        <slot name="right-items" />
      </div>
      <NavBarUserMenu />
    </div>
  </nav>
</template>
