import { requirePermission, AuthorizationError } from "@/lib/authorization";
import { db } from "@/db";
import { participants, registrations, professionalProfiles, transportProfiles, departureProfiles, merchandisePreferences, pickupPoints, merchandiseInventory, auditLogs } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requirePermission("exports", "export");

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type"); // participants, transport, merchandise, pickup_points

    const escapeCsvValue = (value: string | null | undefined): string => {
      if (value == null) return "";
      let strValue = String(value);
      // Protect against CSV formula injection
      if (/^[=+\-@]/.test(strValue)) {
        strValue = "'" + strValue;
      }
      return strValue.replace(/"/g, '""'); // escape quotes
    };

    let csvContent = "";
    const filename = `export_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === "participants") {
      const statusFilter = searchParams.get("status"); // e.g., APPROVED
      
      const query = db
        .select({
          registrationId: registrations.registrationId,
          status: registrations.status,
          fullName: participants.fullName,
          email: participants.email,
          whatsapp: participants.whatsapp,
          cityRegency: participants.cityRegency,
          company: professionalProfiles.companyName,
          industrialArea: professionalProfiles.industrialArea,
        })
        .from(registrations)
        .innerJoin(participants, eq(registrations.participantId, participants.id))
        .leftJoin(professionalProfiles, eq(participants.id, professionalProfiles.participantId));

      const conditions = [];
      if (statusFilter) conditions.push(eq(registrations.status, statusFilter));
      
      const results = await (conditions.length > 0 ? query.where(and(...conditions)) : query);

      csvContent = "Registration ID,Status,Full Name,Email,WhatsApp,City,Company,Industrial Area\n";
      results.forEach(r => {
        csvContent += `"${escapeCsvValue(r.registrationId)}","${escapeCsvValue(r.status)}","${escapeCsvValue(r.fullName)}","${escapeCsvValue(r.email)}","${escapeCsvValue(r.whatsapp)}","${escapeCsvValue(r.cityRegency)}","${escapeCsvValue(r.company)}","${escapeCsvValue(r.industrialArea)}"\n`;
      });
    } else if (type === "transport") {
      const query = db
        .select({
          registrationId: registrations.registrationId,
          fullName: participants.fullName,
          takeBus: transportProfiles.takeBus,
          vehicleType: transportProfiles.vehicleType,
          licensePlate: transportProfiles.licensePlate,
          departureArea: departureProfiles.departureArea,
          pickupPointName: pickupPoints.name,
        })
        .from(registrations)
        .innerJoin(participants, eq(registrations.participantId, participants.id))
        .innerJoin(transportProfiles, eq(participants.id, transportProfiles.participantId))
        .leftJoin(departureProfiles, eq(participants.id, departureProfiles.participantId))
        .leftJoin(pickupPoints, eq(transportProfiles.pickupPointId, pickupPoints.id))
        .where(eq(registrations.status, "APPROVED"));

      const results = await query;
      csvContent = "Registration ID,Full Name,Taking Bus,Vehicle Type,License Plate,Departure Area,Pickup Point\n";
      results.forEach(r => {
        csvContent += `"${escapeCsvValue(r.registrationId)}","${escapeCsvValue(r.fullName)}",${r.takeBus ? 'Yes' : 'No'},"${escapeCsvValue(r.vehicleType)}","${escapeCsvValue(r.licensePlate)}","${escapeCsvValue(r.departureArea)}","${escapeCsvValue(r.pickupPointName)}"\n`;
      });
    } else if (type === "merchandise") {
      const query = db
        .select({
          registrationId: registrations.registrationId,
          fullName: participants.fullName,
          shirtSize: merchandisePreferences.shirtSize,
        })
        .from(registrations)
        .innerJoin(participants, eq(registrations.participantId, participants.id))
        .innerJoin(merchandisePreferences, eq(participants.id, merchandisePreferences.participantId))
        .where(eq(registrations.status, "APPROVED"));

      const results = await query;
      csvContent = "Registration ID,Full Name,T-Shirt Size\n";
      results.forEach(r => {
        csvContent += `"${escapeCsvValue(r.registrationId)}","${escapeCsvValue(r.fullName)}","${escapeCsvValue(r.shirtSize)}"\n`;
      });
    } else if (type === "pickup_points") {
      const query = db.select().from(pickupPoints);
      const results = await query;
      csvContent = "ID,Name,Location Detail,Is Active\n";
      results.forEach(r => {
        csvContent += `"${escapeCsvValue(r.id)}","${escapeCsvValue(r.name)}","${escapeCsvValue(r.locationDetail)}",${r.isActive ? 'Yes' : 'No'}\n`;
      });
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    // Audit Log
    await db.insert(auditLogs).values({
      actorAdminId: user.id,
      action: "EXPORT_GENERATED",
      resourceType: "exports",
      metadata: JSON.stringify({ type, params: Object.fromEntries(searchParams.entries()) }),
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    });

  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
