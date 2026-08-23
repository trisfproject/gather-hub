import { db } from "../db";
import { admins } from "../db/schema";
import { auth } from "../lib/auth";
import "dotenv/config";
import { eq } from "drizzle-orm";

async function seed() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Initial Admin";

  if (!email || !password) {
    console.error("Usage: pnpm db:seed:admin <email> <password> [name]");
    process.exit(1);
  }

  try {
    const existing = await db.select().from(admins).where(eq(admins.email, email));
    
    if (existing.length > 0) {
      console.log(`Admin with email ${email} already exists.`);
      process.exit(0);
    }

    // We use Better Auth's API to ensure the password is mathematically hashed correctly
    // Since we don't have a Request object, we can use the backend API directly.
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    });

    if (!user || !user.user) {
      throw new Error("Failed to create user via Better Auth.");
    }

    // Promote the newly created user to SUPER_ADMIN
    await db.update(admins).set({ role: "SUPER_ADMIN", isActive: true }).where(eq(admins.id, user.user.id));

    console.log(`Successfully created SUPER_ADMIN: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
}

seed();
