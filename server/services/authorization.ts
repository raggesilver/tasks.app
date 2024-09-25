import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import {
  collaborators,
  workspaces,
  type User,
  type Workspace,
} from "../db/schema";

/**
 * Check if a user is a collaborator or owner of a workspace.
 *
 * @param userId The user ID.
 * @param workspaceId The workspace ID.
 */
export const isUserWorkspaceCollaborator = (
  userId: string,
  workspaceId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(collaborators)
    .leftJoin(workspaces, eq(workspaces.ownerId, userId))
    .where(
      and(
        eq(collaborators.workspaceId, workspaceId),
        or(eq(collaborators.userId, userId), eq(workspaces.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

// ...

export async function isUserAllowedToEditWorkspace(
  user: User,
  workspace: Workspace,
): Promise<boolean> {
  return workspace.ownerId === user.id;
}

export async function isUserAllowedToViewWorkspace(
  user: User,
  workspace: Workspace | string,
): Promise<boolean> {
  const workspaceId = typeof workspace === "string" ? workspace : workspace.id;

  if (typeof workspace !== "string" && workspace.ownerId === user.id) {
    return true;
  }

  return isUserWorkspaceCollaborator(user.id, workspaceId);
}

export async function isUserAllowedToDeleteWorkspace(
  user: User,
  workspace: Workspace,
): Promise<boolean> {
  return workspace.ownerId === user.id;
}
