import { eq, or } from "drizzle-orm";
import { db } from "../db/db";
import {
  boards,
  collaborators,
  workspaces,
  type Workspace,
} from "../db/schema";

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  return db.query.workspaces
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
    })
    .execute()
    .then((workspace) => workspace ?? null);
}

export async function getWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  return db
    .selectDistinctOn([workspaces.id])
    .from(workspaces)
    .leftJoin(boards, eq(boards.workspaceId, workspaces.id))
    .leftJoin(collaborators, eq(collaborators.boardId, boards.id))
    .where(or(eq(collaborators.userId, userId), eq(workspaces.ownerId, userId)))
    .execute()
    .then((rows) => rows.map((row) => row.workspaces));
}
