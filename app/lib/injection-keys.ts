import type { InjectionKey } from "vue";
import type { Board, Label, StatusColumn, User } from "~~/server/db/schema";
import type { PublicUser } from "./validation";

export const BOARD_DATA_KEY = Symbol() as InjectionKey<{
  /** @deprecated fetch data on your own */
  board: Ref<Board | undefined>;
  /** @deprecated fetch data on your own */
  collaborators: Ref<User[] | PublicUser[] | undefined>;
  /** @deprecated fetch data on your own */
  columns: Ref<StatusColumn[] | undefined>;
  /** @deprecated fetch data on your own */
  labels: Ref<Label[] | undefined>;
}>;
