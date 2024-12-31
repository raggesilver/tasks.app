import { and, eq, or } from "drizzle-orm";
import { db } from "../db/db";
import {
  boards,
  collaborators,
  type NewWorkspace,
  type Workspace,
  type WorkspaceCollaborator,
  workspaceCollaborators,
  workspaces,
} from "../db/schema";

/**
 * Creates a new workspace entry in the database.
 *
 * @param data - The details of the new workspace to be created.
 * @returns A promise that resolves to the created workspace object.
 */
export async function createWorkspace(data: NewWorkspace): Promise<Workspace> {
  return db
    .insert(workspaces)
    .values(data)
    .returning()
    .execute()
    .then(([workspace]) => workspace);
}

/**
 * Retrieves a workspace by its unique identifier.
 *
 * @param id - The unique identifier of the workspace to retrieve.
 * @returns A promise that resolves to the workspace object if found, or null if
 *   not found.
 */
export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  return db.query.workspaces
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
    })
    .execute()
    .then((workspace) => workspace ?? null);
}

/**
 * Retrieves a list of workspaces associated with a specific user.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to an array of workspaces.
 */
export async function getWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  return db
    .selectDistinctOn([workspaces.id])
    .from(workspaces)
    .leftJoin(boards, eq(boards.workspaceId, workspaces.id))
    .leftJoin(collaborators, eq(collaborators.boardId, boards.id))
    .leftJoin(
      workspaceCollaborators,
      eq(workspaceCollaborators.workspaceId, workspaces.id),
    )
    .where(
      or(
        eq(collaborators.userId, userId),
        eq(workspaces.ownerId, userId),
        eq(workspaceCollaborators.userId, userId),
      ),
    )
    .execute()
    .then((rows) => rows.map((row) => row.workspaces));
}

/**
 * Updates the properties of an existing workspace with the given data.
 *
 * @param workspaceId - The unique identifier of the workspace to be updated.
 * @param data - The partial data object containing the properties to update in
 *   the workspace.
 * @returns A promise that resolves to the updated workspace object.
 */
export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Workspace>,
) {
  return db
    .update(workspaces)
    .set(data)
    .where(eq(workspaces.id, workspaceId))
    .returning()
    .execute()
    .then(([workspace]) => workspace);
}

/**
 * Add a user as a collaborator to a workspace.
 *
 * @param workspaceId - The unique identifier of the workspace.
 * @param userId - The unique identifier of the user to add as a collaborator.
 * @returns A promise that resolves to the created workspace collaborator
 *   object.
 */
export async function addWorkspaceCollaborator(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceCollaborator> {
  return db
    .insert(workspaceCollaborators)
    .values({ workspaceId, userId })
    .onConflictDoNothing()
    .returning()
    .execute()
    .then(([collaborator]) => collaborator);
}

/**
 * Removes a user as a collaborator from a workspace.
 *
 * @param workspaceId - The unique identifier of the workspace.
 * @param userId - The unique identifier of the user to remove as a
 *   collaborator.
 * @returns A promise that resolves to a boolean indicating whether the user was
 *   successfully removed as a collaborator.
 */
export async function removeWorkspaceCollaborator(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  return db
    .delete(workspaceCollaborators)
    .where(
      and(
        eq(workspaceCollaborators.workspaceId, workspaceId),
        eq(workspaceCollaborators.userId, userId),
      ),
    )
    .returning()
    .execute()
    .then((res) => res?.length > 0);
}

/**
 * Retrieves a list of collaborators for a workspace.
 *
 * @param workspaceId - The unique identifier of the workspace.
 * @returns A promise that resolves to an array of workspace collaborator
 *   objects.
 */
export async function getWorkspaceCollaborators(
  workspaceId: string,
): Promise<WorkspaceCollaborator[]> {
  return db.query.workspaceCollaborators
    .findMany({
      where: (table, { eq }) => eq(table.workspaceId, workspaceId),
    })
    .execute();
}
