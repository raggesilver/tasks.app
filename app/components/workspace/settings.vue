<script lang="ts" setup>
import {
  LazyWorkspaceGeneralSettings,
  LazyWorkspaceMemberSettings,
  LazyWorkspacePlanSettings,
  LazyWorkspaceRuleSettings,
  LazyWorkspaceUsage,
} from "#components";
import type { Workspace } from "~~/server/db/schema";

defineProps<{
  workspace: Workspace;
}>();

const validPages = ["general", "members", "rules", "usage", "billing"] as const;
type ValidPage = (typeof validPages)[number];

const components = {
  general: LazyWorkspaceGeneralSettings,
  members: LazyWorkspaceMemberSettings,
  rules: LazyWorkspaceRuleSettings,
  usage: LazyWorkspaceUsage,
  billing: LazyWorkspacePlanSettings,
};

const page = useQueryParam<ValidPage>("settings", {
  defaultValue: "general",
  // @ts-expect-error - I don't know how to please TypeScript here, but it works
  validate: (val) => validPages.includes(val),
});
</script>

<template>
  <div class="space-y-8">
    <Tabs v-model:model-value="page">
      <TabsList>
        <TabsTrigger
          v-for="tab in validPages"
          :key="tab"
          :value="tab"
          class="capitalize"
          >{{ tab }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in validPages" :key="tab" :value="tab">
        <component
          :is="components[tab]"
          v-if="page === tab"
          v-bind="{ workspace }"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
