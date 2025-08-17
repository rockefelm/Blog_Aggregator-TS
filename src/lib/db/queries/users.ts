import { debugPort } from "process";
import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
    const user = await db.select().from(users).where(eq(users.name, name)).limit(1);
    return user[0] || null;
}

export async function reset() {
  await db.delete(users);
  console.log("All users have been reset.");
}

export async function getUsers() {
  const allUsers = await db.select().from(users);
  return allUsers;
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}