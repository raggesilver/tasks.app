import { eq } from "drizzle-orm";
import assert from "node:assert";
import { z } from "zod";
import type { SearchUsersInput } from "~/lib/validation";
import { oauth, users, type User } from "~/server/db/schema";
import { db } from "../db/db";

type Providers = "google" | "github";

type GitHubProfile = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: "User";
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: string;
  email: string;
  hireable?: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};

type GoogleProfile = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
};

type ProviderCallbackMap = {
  google(arg: GoogleProfile): string;
  github(arg: GitHubProfile): string;
};

const switchOnProfile = <P extends Providers = Providers>(
  provider: P,
  profile: GoogleProfile | GitHubProfile,
  m: ProviderCallbackMap,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return m[provider](profile as any);
};

export async function getOrCreateUser(
  provider: Providers,
  profile: GoogleProfile | GitHubProfile,
): Promise<User> {
  const userIdInProvider = switchOnProfile(provider, profile, {
    github: (arg) => arg.id.toString(),
    google: (arg) => arg.sub,
  });

  const oauthEntity = await db.query.oauth.findFirst({
    where: (table, { eq, and }) =>
      and(
        eq(table.provider, provider),
        eq(table.userIdInProvider, userIdInProvider),
      ),
    with: { user: true },
  });

  if (oauthEntity) {
    return oauthEntity.user;
  }

  const { user } = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        fullName: switchOnProfile(provider, profile, {
          github: (arg) => arg.name,
          google: (arg) => `${arg.given_name} ${arg.family_name}`,
        }),
        email: profile.email,
        profilePictureUrl: switchOnProfile(provider, profile, {
          github: (arg) => arg.avatar_url,
          google: (arg) => arg.picture,
        }),
      })
      // .onConflictDoNothing() doesn't work
      // https://github.com/drizzle-team/drizzle-orm/issues/1341
      .onConflictDoUpdate({
        target: users.email,
        set: {
          updatedAt: new Date(),
        },
      })
      .returning()
      .execute();
    assert(user);

    const [oauthEntity] = await tx
      .insert(oauth)
      .values({
        provider,
        userIdInProvider,
        userId: user.id,
      })
      .returning()
      .execute();
    assert(oauthEntity);

    return { user, oauthEntity };
  });

  return user;
}

export const getUserById = async (userId: string): Promise<User | null> => {
  return db.query.users
    .findFirst({
      where: (table, { eq }) => eq(table.id, userId),
    })
    .execute()
    .then((user) => user ?? null);
};

export const updateUserSchema = z
  .object({
    email: z.string().email(),
    fullName: z.string().min(3),
  })
  .partial();

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export async function updateUser(userId: string, data: UpdateUserData) {
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning()
    .execute();

  return user;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const _users = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning()
    .execute();

  return _users.length > 0;
}

export async function searchUsers(data: SearchUsersInput): Promise<User[]> {
  return db.query.users
    .findMany({
      where: (table, { ilike, or }) =>
        or(
          ilike(table.fullName, `%${data.name}%`),
          ilike(table.email, `%${data.email}%`),
        ),
    })
    .execute();
}
