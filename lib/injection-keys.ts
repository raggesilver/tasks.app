import type { InjectionKey } from "vue";
import type { Label, StatusColumn, User, Workspace } from "~/server/db/schema";

export const WORKSPACE_DATA_KEY = Symbol() as InjectionKey<{
  workspace: Ref<Workspace | undefined>;
  collaborators: Ref<User[] | undefined>;
  columns: Ref<StatusColumn[] | undefined>;
  labels: Ref<Label[] | undefined>;
}>;
