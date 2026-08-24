import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { merchandiseInventory, merchandisePreferences, registrations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { MerchandiseClient } from "./merchandise-client";

export const dynamic = 'force-dynamic';

export default async function MerchandisePage() {
  await requirePermission("merchandise", "read");
  
  let canManage = false;
  try {
    await requirePermission("merchandise", "manage");
    canManage = true;
  } catch {}

  // Fetch defined inventory limits
  const inventory = await db.select().from(merchandiseInventory).orderBy(merchandiseInventory.size);

  // Calculate actual allocations based on APPROVED registrations
  const allocationsData = await db
    .select({
      size: merchandisePreferences.shirtSize,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(merchandisePreferences)
    .innerJoin(registrations, eq(merchandisePreferences.participantId, registrations.participantId))
    .where(eq(registrations.status, "APPROVED"))
    .groupBy(merchandisePreferences.shirtSize);

  // Filter out null sizes
  const allocations = allocationsData
    .filter(a => a.size !== null)
    .map(a => ({ size: a.size as string, count: a.count }));

  return (
    <MerchandiseClient 
      inventory={inventory} 
      allocations={allocations} 
      canManage={canManage} 
    />
  );
}
