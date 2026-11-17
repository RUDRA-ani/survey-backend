
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { randomUUID, createHash, randomBytes } from "crypto";

import {
  AdminUser,
  PasswordReset,
  JwtPayload,
} from "../types/auth.types";

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");
const RESETS_FILE = path.join(
  process.cwd(),
  "src/data/password-resets.json"
);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

async function readUsers(): Promise<AdminUser[]> {
  const data = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(data) as AdminUser[];
}

async function writeUsers(users: AdminUser[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function readResets(): Promise<PasswordReset[]> {
  const data = await fs.readFile(RESETS_FILE, "utf-8");
  return JSON.parse(data) as PasswordReset[];
}

async function writeResets(resets: PasswordReset[]): Promise<void> {
  await fs.writeFile(RESETS_FILE, JSON.stringify(resets, null, 2));
}

export async function login(email: string, password: string) {
  const users = await readUsers();

  const user = users.find(
    (item) => item.email === email.trim().toLowerCase()
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getAdminById(userId: string) {
  const users = await readUsers();

  const user = users.find((item) => item.id === userId);

  if (!user) {
    throw new Error("Admin account not found");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function createPasswordReset(email: string) {
  const users = await readUsers();

  const user = users.find(
    (item) => item.email === email.trim().toLowerCase()
  );

  // Return the same result whether the account exists or not.
  if (!user) {
    return null;
  }

  const resets = await readResets();

  // Invalidate previous unused reset requests for this user.
  const activeResets = resets.map((reset) =>
    reset.userId === user.id && !reset.used
      ? { ...reset, used: true }
      : reset
  );

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const expiresInMinutes = Number(
    process.env.RESET_TOKEN_EXPIRES_MINUTES || 15
  );

  const reset: PasswordReset = {
    id: randomUUID(),
    userId: user.id,
    tokenHash,
    expiresAt: new Date(
      Date.now() + expiresInMinutes * 60 * 1000
    ).toISOString(),
    used: false,
    createdAt: new Date().toISOString(),
  };

  activeResets.push(reset);
  await writeResets(activeResets);

  // Development only: return the token so the controller can log a reset link.
  return rawToken;
}

export async function resetPassword(token: string, newPassword: string) {
  const resets = await readResets();

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const reset = resets.find(
    (item) => item.tokenHash === tokenHash
  );

  if (!reset || reset.used || new Date(reset.expiresAt).getTime() <= Date.now()) {
    throw new Error("Invalid or expired password reset token");
  }

  const users = await readUsers();
  const userIndex = users.findIndex(
    (item) => item.id === reset.userId
  );

  if (userIndex === -1) {
    throw new Error("Admin account not found");
  }

  users[userIndex].password = await bcrypt.hash(newPassword, 12);
  await writeUsers(users);

  // Invalidate all reset tokens belonging to this user.
  const updatedResets = resets.map((item) =>
    item.userId === reset.userId
      ? { ...item, used: true }
      : item
  );

  await writeResets(updatedResets);

  return { message: "Password reset successfully" };
}
