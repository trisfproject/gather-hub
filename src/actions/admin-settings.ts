"use server";

import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { eventSettings, auditLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateEventSetting(key: string, value: string) {
  try {
    const { user } = await requirePermission("event", "manage");

    await db.transaction(async (tx) => {
      let existing = await tx.select().from(eventSettings).limit(1);

      if (existing.length === 0) {
        await tx.insert(eventSettings).values({});
        existing = await tx.select().from(eventSettings).limit(1);
      }

      const columnMap: Record<string, string> = {
        "registration_enabled": "registrationEnabled",
        "bus_enabled": "busEnabled",
        "merchandise_enabled": "merchandiseEnabled",
        "invitation_enabled": "invitationEnabled",
        "certificate_enabled": "certificateEnabled",
        "telegram_enabled": "telegramEnabled",
        "whatsapp_enabled": "whatsappEnabled",
      };

      const columnName = columnMap[key];
      if (!columnName) throw new Error("Invalid setting key");

      const isEnabled = value === "true";
      const updateData: Record<string, unknown> = { [columnName]: isEnabled, updatedAt: sql`now()` };

      await tx.update(eventSettings).set(updateData).where(eq(eventSettings.id, existing[0].id));

      await tx.insert(auditLogs).values({
        actorAdminId: user.id,
        action: "EVENT_SETTING_CHANGED",
        resourceType: "setting",
        resourceId: key,
        metadata: JSON.stringify({ oldValue: (existing[0] as Record<string, unknown>)[columnName], newValue: isEnabled }),
      });
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to update event setting." };
  }
}
