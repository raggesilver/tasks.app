import type { User } from "~/server/db/schema";

export const testUsers: User[] = [
  {
    id: "597f3d1e-cbb6-4acf-816b-9672d20f43e7",
    email: "joe@testing.com",
    fullName: "Testing Joe",
    profilePictureUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c51be814-d83f-48ca-b154-4a537fbb70ba",
    email: "dana@testing.com",
    fullName: "Testing Dana",
    profilePictureUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const testid = (id: string) => `[data-testid="${id}"]`;
