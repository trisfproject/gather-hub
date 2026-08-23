"use server";

import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { registrations, auditLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveRegistration(registrationId: string) {
  try {
    const { user } = await requirePermission("registrations", "approve");

    // We must do this in a transaction to ensure audit log and status update are atomic
    await db.transaction(async (tx) => {
      // 1. Verify current status is RECEIVED
      const [reg] = await tx.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
      
      if (!reg) {
        throw new Error("Registration not found");
      }

      if (reg.status !== "RECEIVED") {
        throw new Error(`Cannot approve registration in status: ${reg.status}. Only RECEIVED registrations can be approved.`);
      }

      // 2. Update status
      await tx.update(registrations)
        .set({ status: "APPROVED", updatedAt: sql`now()` })
        .where(eq(registrations.id, registrationId));

      // 3. Create Audit Log
      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: "REGISTRATION_APPROVED",
        resourceType: "registration",
        resourceId: registrationId,
        metadata: JSON.stringify({ previousStatus: "RECEIVED" }),
      });
    });

    revalidatePath(`/admin/registrations/${registrationId}`);
    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to approve registration." };
  }
}

export async function rejectRegistration(registrationId: string) {
  try {
    const { user } = await requirePermission("registrations", "reject");

    await db.transaction(async (tx) => {
      // 1. Verify current status is RECEIVED
      const [reg] = await tx.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
      
      if (!reg) {
        throw new Error("Registration not found");
      }

      if (reg.status !== "RECEIVED") {
        throw new Error(`Cannot reject registration in status: ${reg.status}. Only RECEIVED registrations can be rejected.`);
      }

      // 2. Update status
      await tx.update(registrations)
        .set({ status: "REJECTED", updatedAt: sql`now()` })
        .where(eq(registrations.id, registrationId));

      // 3. Create Audit Log
      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: "REGISTRATION_REJECTED",
        resourceType: "registration",
        resourceId: registrationId,
        metadata: JSON.stringify({ previousStatus: "RECEIVED" }),
      });
    });

    revalidatePath(`/admin/registrations/${registrationId}`);
    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to reject registration." };
  }
}
