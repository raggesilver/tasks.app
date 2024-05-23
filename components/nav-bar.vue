<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const { logout } = useLogout();
const { user } = useUserSession();

const initials = computed(
  () =>
    user.value?.fullName
      .split(" ")
      .map((part) => part[0])
      .join("") ?? "",
);
</script>

<template>
  <nav class="border-b px-8 py-2">
    <div class="flex flex-row items-center">
      <nuxt-link class="text-xl font-bold" to="/app">Tasks.app</nuxt-link>
      <span aria-hidden="true" class="hidden sm:block mx-auto" />
      <CreateWorkspace />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Avatar class="cursor-pointer">
            <AvatarImage
              v-if="user?.profilePictureUrl"
              :src="user.profilePictureUrl"
            />
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem as-child disabled>
              <nuxt-link to="/app/settings">
                <!--<Cog />-->
                Settings
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </nuxt-link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <!--<Keyboard />-->
              Keyboard Shortcuts
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <!--<FileDown />-->
                Export
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem disabled>JSON</DropdownMenuItem>
                  <DropdownMenuItem disabled>CSV</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <!--<Server />-->
            API
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <!--<LifeBuoy />-->
            Help
            <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="logout"> Logout </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
</template>
