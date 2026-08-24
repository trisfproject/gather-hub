"use server";

import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { registrations, auditLogs, transportProfiles } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type BulkResult = {
  id: string;
  success: boolean;
  message?: string;
};

export async function bulkApproveRegistrations(registrationIds: string[]): Promise<BulkResult[]> {
  const { user } = await requirePermission("registrations", "approve");
  const results: BulkResult[] = [];

  for (const id of registrationIds) {
    try {
      await db.transaction(async (tx) => {
        const [reg] = await tx.select().from(registrations).where(eq(registrations.id, id)).limit(1);
        
        if (!reg) throw new Error("Registration not found");
        if (reg.status !== "RECEIVED") throw new Error(`Cannot approve registration in status: ${reg.status}`);

        await tx.update(registrations)
          .set({ status: "APPROVED", updatedAt: sql`now()` })
          .where(eq(registrations.id, id));

        await tx.insert(auditLogs).values({
          actorAdminId: user.id,
          action: "REGISTRATION_APPROVED_BULK",
          resourceType: "registration",
          resourceId: id,
          metadata: JSON.stringify({ previousStatus: "RECEIVED" }),
        });
      });
      results.push({ id, success: true });
    } catch (error: unknown) {
      results.push({ id, success: false, message: error instanceof Error ? error.message : "Failed" });
    }
  }

  revalidatePath("/admin/participants");
  revalidatePath("/admin");
  return results;
}

export async function bulkRejectRegistrations(registrationIds: string[]): Promise<BulkResult[]> {
  const { user } = await requirePermission("registrations", "reject");
  const results: BulkResult[] = [];

  for (const id of registrationIds) {
    try {
      await db.transaction(async (tx) => {
        const [reg] = await tx.select().from(registrations).where(eq(registrations.id, id)).limit(1);
        
        if (!reg) throw new Error("Registration not found");
        if (reg.status !== "RECEIVED") throw new Error(`Cannot reject registration in status: ${reg.status}`);

        await tx.update(registrations)
          .set({ status: "REJECTED", updatedAt: sql`now()` })
          .where(eq(registrations.id, id));

        await tx.insert(auditLogs).values({
          actorAdminId: user.id,
          action: "REGISTRATION_REJECTED_BULK",
          resourceType: "registration",
          resourceId: id,
          metadata: JSON.stringify({ previousStatus: "RECEIVED" }),
        });
      });
      results.push({ id, success: true });
    } catch (error: unknown) {
      results.push({ id, success: false, message: error instanceof Error ? error.message : "Failed" });
    }
  }

  revalidatePath("/admin/participants");
  revalidatePath("/admin");
  return results;
}

export async function bulkAssignPickupPoint(registrationIds: string[], pickupPointId: string): Promise<BulkResult[]> {
  const { user } = await requirePermission("registrations", "manage");
  const results: BulkResult[] = [];

  for (const id of registrationIds) {
    try {
      await db.transaction(async (tx) => {
        const [reg] = await tx.select().from(registrations).where(eq(registrations.id, id)).limit(1);
        if (!reg) throw new Error("Registration not found");

        const [profile] = await tx.select().from(transportProfiles).where(eq(transportProfiles.participantId, reg.participantId)).limit(1);
        
        if (!profile) throw new Error("Transport profile not found");
        // We do not strictly block received/approved here, relying on frontend/admins choice,
        // but we record the change.
        const previousId = profile.pickupPointId;

        await tx.update(transportProfiles)
          .set({ pickupPointId })
          .where(eq(transportProfiles.participantId, reg.participantId));

        await tx.insert(auditLogs).values({
          actorAdminId: user.id,
          action: "PICKUP_POINT_ASSIGNED_BULK",
          resourceType: "participant",
          resourceId: id,
          metadata: JSON.stringify({ previousPickupPointId: previousId, newPickupPointId: pickupPointId }),
        });
      });
      results.push({ id, success: true });
    } catch (error: unknown) {
      results.push({ id, success: false, message: error instanceof Error ? error.message : "Failed" });
    }
  }

  revalidatePath("/admin/participants");
  revalidatePath("/admin/pickup-points");
  return results;
}
