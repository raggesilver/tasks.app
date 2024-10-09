// @vitest-environment nuxt
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { testid, testUsers } from "~/__tests__/utils";
import * as _exports from "~/composables/useBoardCollaborators";
import type { PublicUser } from "~/lib/validation";
import Component from "./index.vue";

mockNuxtImport("useUserSession", () => {
  return () => ({
    // We use the second user as the owner for the current board
    user: ref(testUsers[1]),
  });
});

const spy = vi.spyOn(_exports, "useBoardCollaborators").mockImplementation(
  // @ts-expect-error - we don't return all of useQuery's fields
  () => ({
    data: ref([...testUsers] as PublicUser[]),
    isPending: ref(false),
  }),
);

describe("BoardCollaboratorList", () => {
  it("mounts and renders collaborators", async () => {
    const boardId = "3652d6b9-646d-49ba-b009-227543293d4d";
    const component = await mountSuspended(Component, {
      props: {
        boardId,
      },
    });

    expect(component).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(boardId);

    for (const user of testUsers) {
      expect(component.find(testid(`user-avatar-${user.id}`)).exists()).toBe(
        true,
      );
    }
  });
});
