import type { InjectionKey } from "vue";
import type { Label, StatusColumn, User, Workspace } from "~/server/db/schema";

export const WORKSPACE_DATA_KEY = Symbol() as InjectionKey<{
  /** @deprecated fetch data on your own */
  workspace: Ref<Workspace | undefined>;
  /** @deprecated fetch data on your own */
  collaborators: Ref<User[] | undefined>;
  /** @deprecated fetch data on your own */
  columns: Ref<StatusColumn[] | undefined>;
  /** @deprecated fetch data on your own */
  labels: Ref<Label[] | undefined>;
}>;
