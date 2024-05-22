import type { User as DbUser } from "~/server/db/schema";

declare module "#auth-utils" {
  interface User extends DbUser {
    // Add your own fields
  }

  interface UserSession {
    // Add your own fields
  }
}

export {};
