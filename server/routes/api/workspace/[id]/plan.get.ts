import { validateId } from "~/lib/validation";
import { isUserWorkspaceOwner } from "~~/server/services/authorization";
import { planService } from "~~/server/services/plan";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id } = await getValidatedRouterParams(
    event,
    validateId("id").parseAsync,
  );

  if (false === (await isUserWorkspaceOwner(user.id, id))) {
    throw createError({
      status: 403,
      statusMessage: "You are not the owner of this workspace.",
    });
  }

  const plan = await planService.getPlanForWorkspace(id);

  return { plan };
});
