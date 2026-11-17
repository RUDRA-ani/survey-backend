
import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

import { AdminUser } from "../types/auth.types";

const USERS_FILE = path.join(
  process.cwd(),
  "src/data/users.json"
);

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  if (password.length < 8) {
    throw new Error("Admin password must be at least 8 characters long");
  }

  let users: AdminUser[] = [];

  try {
    const fileContent = await fs.readFile(USERS_FILE, "utf-8");
    users = JSON.parse(fileContent);
  } catch (error) {
    throw new Error("Could not read users.json. Check that the file exists and contains []");
  }

  const existingAdmin = users.find(
    (user) => user.email.toLowerCase() === email
  );

  if (existingAdmin) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin: AdminUser = {
    id: randomUUID(),
    email,
    password: hashedPassword,
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  users.push(admin);

  await fs.writeFile(
    USERS_FILE,
    JSON.stringify(users, null, 2),
    "utf-8"
  );

  console.log(`Admin account created successfully: ${email}`);
}

createAdmin().catch((error) => {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
});
