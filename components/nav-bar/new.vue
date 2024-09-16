<script lang="ts" setup></script>

<template>
  <nav class="p-4">
    <div class="flex flex-row items-center gap-4">
      <div
        id="nav-bar-left-items"
        class="flex flex-row gap-inherit items-inherit"
      >
        <slot name="left-items">
          <AppBreadcrumbs :entries="[{ title: 'Home', link: '/app' }]" />
        </slot>
      </div>
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
