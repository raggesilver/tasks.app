import { and, eq, or } from "drizzle-orm";
import { db } from "../db/db";
import {
  collaborators,
  users,
  workspaces,
  type NewWorkspace,
  type Workspace,
} from "../db/schema";

export const createWorkspace = async (
  userId: string,
  data: Omit<NewWorkspace, "ownerId" | "createdAt" | "updatedAt" | "id">,
  // TODO: add support for adding collaborators from the start
): Promise<Workspace> => {
  const [workspace] = await db
    .insert(workspaces)
    .values({
      ...data,
      ownerId: userId,
    })
    .returning()
    .execute();

  return workspace;
};

export const getWorkspaceById = async (
  userId: string,
  id: string,
): Promise<Workspace | null> => {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .leftJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .leftJoin(users, eq(users.id, collaborators.userId))
    .where(
      or(
        and(eq(users.id, userId), eq(workspaces.id, id)),
        eq(workspaces.ownerId, userId),
      ),
    )
    .limit(1)
    .execute();

  return workspace ? workspace.workspaces : null;
};

export const getAllWorkspaces = async (
  userId: string,
): Promise<Workspace[]> => {
  return db
    .select()
    .from(workspaces)
    .leftJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .leftJoin(users, eq(users.id, collaborators.userId))
    .where(or(eq(users.id, userId), eq(workspaces.ownerId, userId)))
    .execute()
    .then((rows) => rows.map((row) => row.workspaces));
};
