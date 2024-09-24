import { getActiveInvitationForWorkspace } from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const workspaceId = getRouterParam(event, "id")!;

  // TODO: we may want to throw a 404 if the workspace does not exist

  // FIXME: verify that the user is a member of this workspace

  return getActiveInvitationForWorkspace(workspaceId);
});
