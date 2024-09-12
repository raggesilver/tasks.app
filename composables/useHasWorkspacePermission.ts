import type { Workspace } from "~/server/db/schema";

export const useHasWorkspacePermission = (
  workspace: MaybeRefOrGetter<Workspace | null | undefined>,
) => {
  // This is a temporary implementation that returns true if the user is the
  // owner of the workspace

  const { user } = useUserSession();

  const hasPermission = computed(
    () => toValue(workspace)?.ownerId === user.value?.id,
  );

  return hasPermission;
};
