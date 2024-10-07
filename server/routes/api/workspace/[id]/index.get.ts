import { validateId } from "~/lib/validation";
import { isUserAllowedToViewWorkspace } from "~~/server/services/authorization";
import { _getWorkspaceById } from "~~/server/services/workspace";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { id } = await getValidatedRouterParams(event, validateId("id").parse);

  const workspace = await _getWorkspaceById(id);

  if (!workspace) {
    throw createError({ status: 404, message: "Workspace not found" });
  }

  if (false === (await isUserAllowedToViewWorkspace(user, workspace))) {
    throw createError({
      status: 403,
      message: "You are not allowed to view this workspace",
    });
  }

  const storage = useStorageS3(event);

  const cookie = await storage.getWorkspaceAccessCookie(id);

  for (const key in cookie) {
    setCookie(event, key, cookie[key as keyof typeof cookie] as string);
  }

  // const cookieString = Object.entries(cookie)
  //   .map(([key, value]) => `${key}=${value}`)
  //   .join("; ");
  //
  // setResponseHeader(event, "Set-Cookie", cookieString);

  return workspace;
});
