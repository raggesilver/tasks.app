import type { PostgresError } from "postgres";

export class DuplicateError extends Error {
  /**
   * The field that caused the duplicate error.
   */
  field: string;

  constructor(field: string, message?: string) {
    super(message);
    this.name = "DuplicateError";
    this.field = field;
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export enum PgErrorCode {
  FOREIGN_KEY_VIOLATION = "23503",
  UNIQUE_VIOLATION = "23505",
}

export const isPostgresError = (e: unknown): e is PostgresError => {
  return e instanceof Error && "code" in e;
};
