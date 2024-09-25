import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db/db";
import {
  collaborators,
  labels,
  tasks,
  workspaces,
  type User,
  type Workspace,
} from "../db/schema";

/**
 * Check if a user is the owner of a workspace.
 *
 * @param userId The user ID.
 * @param workspaceId The workspace ID.
 */
export const isUserWorkspaceOwner = (userId: string, workspaceId: string) =>
  db
    .select({ res: sql`1` })
    .from(workspaces)
    .where(and(eq(workspaces.ownerId, userId), eq(workspaces.id, workspaceId)))
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

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

/**
 * Check if a user is a collaborator or owner of the workspace that a task
 * belongs to.
 *
 * @param userId The user ID.
 * @param taskId The task ID.
 */
export const isUserWorkspaceCollaboratorForTask = (
  userId: string,
  taskId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(collaborators)
    .leftJoin(workspaces, eq(workspaces.ownerId, userId))
    .leftJoin(tasks, eq(tasks.workspaceId, workspaces.id))
    .where(
      and(
        eq(tasks.id, taskId),
        or(eq(collaborators.userId, userId), eq(workspaces.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);

export const isUserWorkspaceCollaboratorForLabel = (
  userId: string,
  labelId: string,
) =>
  db
    .select({ res: sql`1` })
    .from(collaborators)
    .leftJoin(workspaces, eq(workspaces.ownerId, userId))
    .leftJoin(labels, eq(labels.workspaceId, workspaces.id))
    .where(
      and(
        eq(labels.id, labelId),
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

export async function isUserAllowedToModifyLabel(
  userId: string,
  labelId: string,
): Promise<boolean> {
  // Currently, only workspace owners can modify labels.
  return db
    .select({ res: sql`1` })
    .from(labels)
    .leftJoin(workspaces, eq(workspaces.id, labels.workspaceId))
    .where(and(eq(labels.id, labelId), eq(workspaces.ownerId, userId)))
    .limit(1)
    .execute()
    .then((rows) => rows[0]?.res === 1);
}

export async function isUserAllowedToCreateOrModifyWorkspaceInvitation(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  return isUserWorkspaceOwner(userId, workspaceId);
}

export async function isUserAllowedToCreateOrModifyColumns(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  return isUserWorkspaceCollaborator(userId, workspaceId);
}
