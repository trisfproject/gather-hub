"use server";

import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { pickupPoints, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPickupPoint(data: { name: string; detail: string }) {
  try {
    const { user } = await requirePermission("pickup_points", "create");

    await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(pickupPoints).values({
        name: data.name,
        locationDetail: data.detail,
        isActive: true
      }).returning({ id: pickupPoints.id });

      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: "PICKUP_POINT_CREATED",
        resourceType: "pickup_point",
        resourceId: inserted.id,
      });
    });

    revalidatePath("/admin/pickup-points");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to create pickup point." };
  }
}

export async function togglePickupPointStatus(id: string, isActive: boolean) {
  try {
    const { user } = await requirePermission("pickup_points", "update");

    await db.transaction(async (tx) => {
      await tx.update(pickupPoints).set({ isActive }).where(eq(pickupPoints.id, id));

      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: "PICKUP_POINT_STATUS_CHANGED",
        resourceType: "pickup_point",
        resourceId: id,
        metadata: JSON.stringify({ isActive }),
      });
    });

    revalidatePath("/admin/pickup-points");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update pickup point." };
  }
}
