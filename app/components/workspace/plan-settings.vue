<script lang="ts" setup>
import { getFetchErrorMessage } from "~/lib/utils";
import type { Workspace } from "~~/server/db/schema";

const props = defineProps<{ workspace: Workspace }>();

const {
  data: plan,
  error,
  isPending,
  suspense,
} = useWorkspacePlan(() => props.workspace.id);

if (import.meta.env.SSR) {
  await suspense();
}
</script>

<template>
  <div class="space-y-lg mt-6">
    <section>
      <div class="flex flex-row items-center gap-2">
        <SheetTitle>Plan & Billing</SheetTitle>
        <ActivityIndicator v-if="isPending" />
      </div>
      <SheetDescription>
        Manage your workspace plan and payment methods.
      </SheetDescription>
    </section>

    <template v-if="!isPending">
      <div v-if="plan">Plan: {{ plan.name }}</div>

      <div v-else-if="error">
        <span class="text-red-500 font-semibold">{{
          getFetchErrorMessage(error, "Failed to fetch plan")
        }}</span>
      </div>

      <div v-else>You are on the free plan</div>
    </template>
  </div>
</template>
