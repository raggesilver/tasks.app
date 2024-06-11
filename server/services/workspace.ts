import { and, eq, or, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import { UpdateWorkspaceInput } from "~/lib/validation";
import { db } from "../db/db";
import {
  collaborators,
  users,
  workspaces,
  type NewWorkspace,
  type User,
  type Workspace,
} from "../db/schema";

export async function createWorkspace(
  userId: string,
  data: Omit<NewWorkspace, "ownerId" | "createdAt" | "updatedAt" | "id">,
): Promise<Workspace> {
  const [workspace] = await db
    .insert(workspaces)
    .values({
      ...data,
      ownerId: userId,
    })
    .returning()
    .execute();

  return workspace;
}

export async function getWorkspaceById(
  userId: string,
  id: string,
): Promise<Workspace | null> {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .leftJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .leftJoin(users, eq(users.id, collaborators.userId))
    .where(
      and(
        eq(workspaces.id, id),
        or(eq(users.id, userId), eq(workspaces.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute();

  return workspace ? workspace.workspaces : null;
}

export async function getAllWorkspaces(userId: string): Promise<Workspace[]> {
  return db
    .select()
    .from(workspaces)
    .leftJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .leftJoin(users, eq(users.id, collaborators.userId))
    .where(or(eq(users.id, userId), eq(workspaces.ownerId, userId)))
    .execute()
    .then((rows) => rows.map((row) => row.workspaces));
}

export async function getWorkspaceCollaborators(
  workspaceId: string,
): Promise<User[]> {
  return union(
    db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        profilePictureUrl: users.profilePictureUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(collaborators, eq(users.id, collaborators.userId))
      .where(eq(collaborators.workspaceId, workspaceId)),
    db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        profilePictureUrl: users.profilePictureUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(
        eq(
          users.id,
          sql`(SELECT owner_id FROM workspaces WHERE id = ${workspaceId})`,
        ),
      ),
  );
}

export async function updateWorkspaceById(
  id: string,
  data: UpdateWorkspaceInput,
): Promise<Workspace | null> {
  const [workspace] = await db
    .update(workspaces)
    .set(data)
    .where(eq(workspaces.id, id))
    .returning()
    .execute();

  return workspace ?? null;
}

export async function deleteWorkspaceById(id: string): Promise<boolean> {
  const [workspace] = await db
    .delete(workspaces)
    .where(eq(workspaces.id, id))
    .returning()
    .execute();

  return !!workspace;
}

export async function addCollaboratorById(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const [collaborator] = await db
    .insert(collaborators)
    .values({ workspaceId, userId })
    .onConflictDoNothing()
    .returning()
    .execute();

  return !!collaborator;
}

export async function removeCollaboratorById(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const [collaborator] = await db
    .delete(collaborators)
    .where(
      and(
        eq(collaborators.workspaceId, workspaceId),
        eq(collaborators.userId, userId),
      ),
    )
    .returning()
    .execute();

  return !!collaborator;
}
