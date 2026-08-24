import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { registrations, participants, merchandisePreferences, transportProfiles, pickupPoints, departureProfiles, professionalProfiles } from "@/db/schema";
import { eq, or, and, sql, ilike, desc } from "drizzle-orm";
import { ParticipantsClient } from "./participants-client";

export const dynamic = 'force-dynamic';

export default async function ParticipantsPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const { user } = await requirePermission("participants", "read");
  
  let canManage = false;
  let canExport = false;
  try { await requirePermission("registrations", "manage"); canManage = true; } catch {}
  try { await requirePermission("exports", "export"); canExport = true; } catch {}

  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? parseInt(searchParams.limit) : 25;
  const offset = (Math.max(1, page) - 1) * Math.min(Math.max(1, limit), 100);
  
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : '';

  // Base Query for counts and fetching
  const baseQuery = db
    .select({
      id: registrations.id,
      registrationId: registrations.registrationId,
      status: registrations.status,
      fullName: participants.fullName,
      email: participants.email,
      whatsapp: participants.whatsapp,
      shirtSize: merchandisePreferences.shirtSize,
      takeBus: transportProfiles.takeBus,
      vehicleType: transportProfiles.vehicleType,
      pickupPointName: pickupPoints.name,
    })
    .from(registrations)
    .innerJoin(participants, eq(registrations.participantId, participants.id))
    .leftJoin(merchandisePreferences, eq(participants.id, merchandisePreferences.participantId))
    .leftJoin(transportProfiles, eq(participants.id, transportProfiles.participantId))
    .leftJoin(pickupPoints, eq(transportProfiles.pickupPointId, pickupPoints.id));

  const conditions = [];

  if (q) {
    const searchPattern = `%${q}%`;
    conditions.push(or(
      ilike(participants.fullName, searchPattern),
      ilike(participants.email, searchPattern),
      ilike(participants.whatsapp, searchPattern),
      ilike(registrations.registrationId, searchPattern)
    ));
  }

  if (status) {
    conditions.push(eq(registrations.status, status));
  }

  const queryWithConditions = conditions.length > 0 
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  // Fetch paginated data
  const data = await queryWithConditions
    .orderBy(desc(registrations.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch total count (simplification by reusing conditions)
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(registrations)
    .innerJoin(participants, eq(registrations.participantId, participants.id));
    
  const totalResult = await (conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery);
  const total = Number(totalResult[0]?.count || 0);

  // Fetch pickup points for the bulk action dropdown
  const allPickupPoints = await db.select({
    id: pickupPoints.id,
    name: pickupPoints.name
  }).from(pickupPoints).where(eq(pickupPoints.isActive, true));

  return (
    <ParticipantsClient 
      participants={data}
      total={total}
      pickupPoints={allPickupPoints}
      canManage={canManage}
      canExport={canExport}
    />
  );
}
