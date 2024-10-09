import { and, eq, or, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import type { UpdateBoardInput } from "~/lib/validation";
import { db } from "../db/db";
import {
  boards,
  collaborators,
  users,
  type Board,
  type NewBoard,
  type User,
} from "../db/schema";

export async function createBoard(
  userId: string,
  data: Omit<NewBoard, "ownerId" | "createdAt" | "updatedAt" | "id">,
): Promise<Board> {
  const [board] = await db
    .insert(boards)
    .values({
      ...data,
      ownerId: userId,
    })
    .returning()
    .execute();

  return board;
}

export async function _getBoardById(id: string): Promise<Board | null> {
  const board = await db.query.boards
    .findFirst({
      where: (table, { eq }) => eq(table.id, id),
    })
    .execute();

  return board ?? null;
}

// FIXME: this function is mixing authorization and data fetching. We should
// check if the user has access to the board in a separate function.
/**
 * @deprecated migrate to {@link _getBoardById}
 */
export async function getBoardById(
  userId: string,
  id: string,
): Promise<Board | null> {
  const [board] = await db
    .select()
    .from(boards)
    .leftJoin(collaborators, eq(boards.id, collaborators.boardId))
    .leftJoin(users, eq(users.id, collaborators.userId))
    .where(
      and(
        eq(boards.id, id),
        or(eq(users.id, userId), eq(boards.ownerId, userId)),
      ),
    )
    .limit(1)
    .execute();

  return board ? board.boards : null;
}

export async function getAllBoards(userId: string): Promise<Board[]> {
  return db
    .select()
    .from(boards)
    .leftJoin(collaborators, eq(boards.id, collaborators.boardId))
    .leftJoin(users, eq(users.id, collaborators.userId))
    .where(or(eq(users.id, userId), eq(boards.ownerId, userId)))
    .execute()
    .then((rows) => rows.map((row) => row.boards));
}

export async function getBoardCollaborators(boardId: string): Promise<User[]> {
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
      .where(eq(collaborators.boardId, boardId)),
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
        eq(users.id, sql`(SELECT owner_id FROM boards WHERE id = ${boardId})`),
      ),
  );
}

export async function updateBoardById(
  id: string,
  data: UpdateBoardInput,
): Promise<Board | null> {
  const [board] = await db
    .update(boards)
    .set(data)
    .where(eq(boards.id, id))
    .returning()
    .execute();

  return board ?? null;
}

export async function deleteBoardById(id: string): Promise<boolean> {
  const [board] = await db
    .delete(boards)
    .where(eq(boards.id, id))
    .returning()
    .execute();

  return !!board;
}

export async function addCollaboratorById(
  boardId: string,
  userId: string,
): Promise<boolean> {
  const [collaborator] = await db
    .insert(collaborators)
    .values({ boardId, userId })
    .onConflictDoNothing()
    .returning()
    .execute();

  return !!collaborator;
}

export async function removeCollaboratorById(
  boardId: string,
  userId: string,
): Promise<boolean> {
  const [collaborator] = await db
    .delete(collaborators)
    .where(
      and(eq(collaborators.boardId, boardId), eq(collaborators.userId, userId)),
    )
    .returning()
    .execute();

  return !!collaborator;
}
