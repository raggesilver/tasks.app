import { eq } from "drizzle-orm";
import { db } from "../db/db";
import {
  invitationLinks,
  type InvitationLink,
  type NewInvitationLink,
} from "../db/schema";

/**
 * Create a new invitation link.
 *
 * This function will deactivate all other invitation links for the workspace if
 * the new invitation link is active (the default behavior).
 *
 * @param data - The data for the new invitation link.
 * @returns The created invitation link.
 */
export async function createInvitation(
  data: NewInvitationLink,
): Promise<InvitationLink> {
  return db.transaction(async (tx) => {
    if (data.active !== false) {
      // Deactivate all other invitation links for the workspace
      await tx
        .update(invitationLinks)
        .set({ active: false })
        .where(eq(invitationLinks.workspaceId, data.workspaceId))
        .execute();
    }

    return tx
      .insert(invitationLinks)
      .values(data)
      .returning()
      .execute()
      .then((res) => res[0]);
  });
}

export async function getInvitationById(
  invidationId: string,
): Promise<InvitationLink | null> {
  return db.query.invitationLinks
    .findFirst({ where: (table, { eq }) => eq(table.id, invidationId) })
    .execute()
    .then((res) => res ?? null);
}

export async function getActiveInvitationForWorkspace(
  workspaceId: string,
): Promise<InvitationLink | null> {
  return db.query.invitationLinks
    .findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.workspaceId, workspaceId), eq(table.active, true)),
    })
    .execute()
    .then((res) => res ?? null);
}

// We currently fetch invitation links by id. In the future, we will modify it's
// schema to add a token field, which is longer and more secure than an id. To
// future proof our code, we will reference `token` instead of `id` in this
// function from the start.
export async function getInvitationByToken(
  token: string,
): Promise<InvitationLink | null> {
  return db.query.invitationLinks
    .findFirst({
      where: (table, { eq }) => eq(table.id, token),
    })
    .execute()
    .then((res) => res ?? null);
}

export async function deactivateInvitationById(
  id: string,
): Promise<InvitationLink | null> {
  return db
    .update(invitationLinks)
    .set({ active: false })
    .where(eq(invitationLinks.id, id))
    .returning()
    .execute()
    .then((res) => res[0] ?? null);
}

export async function deleteInvitationById(id: string): Promise<boolean> {
  return db
    .delete(invitationLinks)
    .where(eq(invitationLinks.id, id))
    .returning()
    .execute()
    .then((res) => res.length > 0);
}
