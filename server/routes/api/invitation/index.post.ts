import { createInvitationSchema } from "~/lib/validation";
import {
  isUserAllowedToCreateOrModifyBoardInvitation,
  isUserAllowedToCreateOrModifyWorkspaceInvitation,
} from "~~/server/services/authorization";
import { createInvitation } from "~~/server/services/invitation";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const data = await readValidatedBody(
    event,
    createInvitationSchema.parseAsync,
  );

  if ("workspaceId" in data) {
    const { workspaceId } = data;

    if (
      false ===
      (await isUserAllowedToCreateOrModifyWorkspaceInvitation(
        user.id,
        workspaceId,
      ))
    ) {
      throw createError({
        status: 403,
        message:
          "You are not authorized to create or modify workspace invitation links",
      });
    }

    return createInvitation({ workspaceId });
  }

  if (
    false ===
    (await isUserAllowedToCreateOrModifyBoardInvitation(user.id, data.boardId))
  ) {
    throw createError({
      status: 403,
      message:
        "You are not authorized to create or modify board invitation links",
    });
  }

  return createInvitation(data);
});
