import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { admins } from "./auth";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  actorAdminId: text("actor_admin_id").references(() => admins.id).notNull(),
  action: text("action").notNull(), // e.g., REGISTRATION_APPROVED, ADMIN_CREATED
  resourceType: text("resource_type").notNull(), // e.g., registration, admin, setting
  resourceId: text("resource_id"), // The ID of the affected resource
  metadata: text("metadata"), // JSON stringified non-sensitive context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
