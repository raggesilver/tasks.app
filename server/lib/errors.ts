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
