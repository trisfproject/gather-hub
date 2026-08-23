"use server";

import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { admins, auditLogs } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleAdminStatus(adminId: string, isActive: boolean) {
  try {
    const { user } = await requirePermission("admins", "manage");

    await db.transaction(async (tx) => {
      // Last SUPER_ADMIN protection
      if (!isActive) {
        const [targetAdmin] = await tx.select().from(admins).where(eq(admins.id, adminId)).limit(1);
        if (targetAdmin?.role === "SUPER_ADMIN") {
          const superAdminsCountResult = await tx.select({ count: sql<number>`count(*)` })
            .from(admins)
            .where(and(eq(admins.role, "SUPER_ADMIN"), eq(admins.isActive, true)));
          
          if (Number(superAdminsCountResult[0]?.count || 0) <= 1) {
            throw new Error("Cannot disable the last active SUPER_ADMIN.");
          }
        }
      }

      await tx.update(admins).set({ isActive }).where(eq(admins.id, adminId));

      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: isActive ? "ADMIN_ENABLED" : "ADMIN_DISABLED",
        resourceType: "admin",
        resourceId: adminId,
      });
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update admin status." };
  }
}

export async function changeAdminRole(adminId: string, newRole: string) {
  try {
    const { user } = await requirePermission("admins", "manage");

    await db.transaction(async (tx) => {
      const [targetAdmin] = await tx.select().from(admins).where(eq(admins.id, adminId)).limit(1);
      
      if (!targetAdmin) throw new Error("Admin not found.");

      // Self-escalation protection
      if (adminId === user.id) {
        throw new Error("You cannot change your own role.");
      }

      // Last SUPER_ADMIN protection
      if (targetAdmin.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
        const superAdminsCountResult = await tx.select({ count: sql<number>`count(*)` })
          .from(admins)
          .where(and(eq(admins.role, "SUPER_ADMIN"), eq(admins.isActive, true)));
        
        if (Number(superAdminsCountResult[0]?.count || 0) <= 1) {
          throw new Error("Cannot demote the last active SUPER_ADMIN.");
        }
      }

      await tx.update(admins).set({ role: newRole }).where(eq(admins.id, adminId));

      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: "ADMIN_ROLE_CHANGED",
        resourceType: "admin",
        resourceId: adminId,
        metadata: JSON.stringify({ oldRole: targetAdmin.role, newRole }),
      });
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to change admin role." };
  }
}
