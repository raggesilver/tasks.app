<script lang="ts" setup>
import { getInitials } from "~/lib/utils";

const { user } = useUserSession();
const { logout } = useLogout();

const initials = computed(() => getInitials(user.value!.fullName));
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Avatar class="cursor-pointer" size="xs">
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
          <nuxt-link to="#">
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
</template>
