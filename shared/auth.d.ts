import type { User as DbUser } from "~~/server/db/schema";

declare module "#auth-utils" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends DbUser {
    // Add your own fields
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface UserSession {
    // Add your own fields
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
