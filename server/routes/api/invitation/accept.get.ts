import { z } from "zod";
import { getInvitationByToken } from "~/server/services/invitation";
import { addCollaboratorById } from "~/server/services/workspace";

const schema = z.object({
  token: z.string(),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    const currentURL = getRequestURL(event);

    const redirectURL = new URL("/sign-in", currentURL);
    redirectURL.searchParams.set(
      "redirectTo",
      currentURL.pathname + currentURL.search,
    );
    // I still seem to be getting this error
    // https://github.com/nuxt/nuxt/issues/25108
    redirectURL.protocol = "https:";

    return sendRedirect(event, redirectURL.toString());
  }

  const { user } = session;

  const query = await getValidatedQuery(event, schema.parseAsync);

  const invitation = await getInvitationByToken(query.token);

  if (!invitation) {
    throw createError({ status: 400, message: "Invalid token" });
  }

  if (!invitation.active) {
    throw createError({
      status: 400,
      message: "This invitation link has expired",
    });
  }

  await addCollaboratorById(invitation.workspaceId, user.id);

  return sendRedirect(event, `/app/workspace/${invitation.workspaceId}`);
});
