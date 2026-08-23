import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { admins, sessions, accounts, verifications } from "@/db/schema/auth";
import { env } from "@/config/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: admins,
      session: sessions,
      account: accounts,
      verification: verifications
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.AUTH_SECRET,
  baseURL: env.APP_URL,
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
});
