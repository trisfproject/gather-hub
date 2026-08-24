import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { admins } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export type Role = "SUPER_ADMIN" | "ADMIN" | "COMMITTEE" | "CHECKIN" | "VIEWER";
export type Resource = "dashboard" | "participants" | "registrations" | "event" | "news" | "sharing_session" | "pickup_points" | "admins" | "audit_logs" | "merchandise" | "exports";
export type Action = "read" | "create" | "update" | "delete" | "approve" | "reject" | "manage" | "export";

// Define the permissions matrix
const PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  SUPER_ADMIN: {
    dashboard: ["read"],
    participants: ["read", "manage"],
    registrations: ["read", "approve", "reject", "manage"],
    event: ["read", "update", "manage"],
    news: ["read", "create", "update", "delete", "manage"],
    sharing_session: ["read", "create", "update", "delete", "manage"],
    pickup_points: ["read", "create", "update", "delete", "manage"],
    admins: ["read", "create", "update", "delete", "manage"],
    audit_logs: ["read"],
    merchandise: ["read", "manage"],
    exports: ["read", "export"],
  },
  ADMIN: {
    dashboard: ["read"],
    participants: ["read", "manage"],
    registrations: ["read", "approve", "reject", "manage"],
    event: ["read"],
    news: ["read", "create", "update", "delete", "manage"],
    sharing_session: ["read", "create", "update", "delete", "manage"],
    pickup_points: ["read", "create", "update", "delete", "manage"],
    admins: [], // cannot manage admins
    audit_logs: [],
    merchandise: ["read", "manage"],
    exports: ["read", "export"],
  },
  COMMITTEE: {
    dashboard: ["read"],
    participants: ["read"],
    registrations: ["read", "approve", "reject"],
    event: ["read"],
    news: ["read", "update"], // limited
    sharing_session: ["read", "update"], // limited
    pickup_points: ["read"], // cannot manage
    admins: [],
    audit_logs: [],
    merchandise: ["read"], // read-only inventory
    exports: ["read", "export"], // can export participants
  },
  CHECKIN: {
    dashboard: ["read"],
    participants: ["read"],
    registrations: ["read"],
    event: ["read"],
    news: ["read"],
    sharing_session: ["read"],
    pickup_points: ["read"],
    admins: [],
    audit_logs: [],
    merchandise: ["read"],
    exports: [],
  },
  VIEWER: {
    dashboard: ["read"],
    participants: ["read"],
    registrations: ["read"],
    event: ["read"],
    news: ["read"],
    sharing_session: ["read"],
    pickup_points: ["read"],
    admins: [],
    audit_logs: [],
    merchandise: ["read"],
    exports: [],
  }
};

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Validates the session and returns the authorized admin user if they have the required permission.
 * Throws an AuthorizationError if unauthenticated, disabled, or unauthorized.
 */
export async function requirePermission(resource: Resource, action: Action) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || !sessionResult.session || !sessionResult.user) {
    throw new AuthorizationError("Unauthenticated");
  }

  // Fetch the latest admin data to ensure status and role are current
  const [adminUser] = await db.select().from(admins).where(eq(admins.id, sessionResult.user.id)).limit(1);

  if (!adminUser) {
    throw new AuthorizationError("Admin account not found");
  }

  if (!adminUser.isActive) {
    throw new AuthorizationError("Account is disabled");
  }

  const role = adminUser.role as Role;
  
  if (!PERMISSIONS[role]) {
    throw new AuthorizationError("Invalid role");
  }

  const allowedActions = PERMISSIONS[role][resource] || [];
  
  if (!allowedActions.includes(action) && !allowedActions.includes("manage")) {
    throw new AuthorizationError(`Missing required permission: ${action} on ${resource}`);
  }

  return { session: sessionResult.session, user: adminUser };
}
