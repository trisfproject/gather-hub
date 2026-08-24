"use server";

import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { merchandiseInventory, auditLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function upsertMerchandiseInventory(size: string, stock: number) {
  try {
    const { user } = await requirePermission("merchandise", "manage");

    if (!size || stock < 0) {
      throw new Error("Invalid size or negative stock");
    }

    await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(merchandiseInventory).where(eq(merchandiseInventory.size, size)).limit(1);

      if (existing) {
        await tx.update(merchandiseInventory)
          .set({ stock, updatedAt: sql`now()` })
          .where(eq(merchandiseInventory.size, size));
          
        await tx.insert(auditLogs).values({
          actorAdminId: user.id,
          action: "MERCHANDISE_INVENTORY_UPDATED",
          resourceType: "merchandise",
          resourceId: existing.id,
          metadata: JSON.stringify({ size, previousStock: existing.stock, newStock: stock }),
        });
      } else {
        const [inserted] = await tx.insert(merchandiseInventory)
          .values({ size, stock })
          .returning({ id: merchandiseInventory.id });
          
        await tx.insert(auditLogs).values({
          actorAdminId: user.id,
          action: "MERCHANDISE_INVENTORY_CREATED",
          resourceType: "merchandise",
          resourceId: inserted.id,
          metadata: JSON.stringify({ size, newStock: stock }),
        });
      }
    });

    revalidatePath("/admin/merchandise");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update inventory" };
  }
}
