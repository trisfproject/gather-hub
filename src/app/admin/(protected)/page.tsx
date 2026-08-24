import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { registrations, transportProfiles, merchandisePreferences, merchandiseInventory } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, FileText, Bus, Car, ShoppingBag } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requirePermission("dashboard", "read");

  const metricsQuery = await db.select({
    status: registrations.status,
    count: sql<number>`count(*)`.mapWith(Number),
  }).from(registrations).groupBy(registrations.status);

  const metrics = metricsQuery.reduce((acc, curr) => {
    acc[curr.status] = curr.count;
    acc.TOTAL += curr.count;
    return acc;
  }, { TOTAL: 0, RECEIVED: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0, CHECKED_IN: 0 } as Record<string, number>);

  // Transport Metrics
  const transportQuery = await db.select({
    takeBus: transportProfiles.takeBus,
    vehicleType: transportProfiles.vehicleType,
    count: sql<number>`count(*)`.mapWith(Number),
  })
  .from(transportProfiles)
  .innerJoin(registrations, eq(transportProfiles.participantId, registrations.participantId))
  .where(eq(registrations.status, 'APPROVED'))
  .groupBy(transportProfiles.takeBus, transportProfiles.vehicleType);

  const transportStats = transportQuery.reduce((acc, curr) => {
    if (curr.takeBus) acc.bus += curr.count;
    else if (curr.vehicleType === 'MOBIL') acc.mobil += curr.count;
    else if (curr.vehicleType === 'MOTOR') acc.motor += curr.count;
    else acc.none += curr.count;
    return acc;
  }, { bus: 0, mobil: 0, motor: 0, none: 0 });

  // Merchandise Metrics
  const totalAllocatedQuery = await db.select({
    count: sql<number>`count(*)`.mapWith(Number),
  })
  .from(merchandisePreferences)
  .innerJoin(registrations, and(
    eq(merchandisePreferences.participantId, registrations.participantId),
    eq(registrations.status, 'APPROVED')
  ));

  const totalAllocated = totalAllocatedQuery[0]?.count || 0;

  const statCards = [
    { title: "Total Registrations", value: metrics.TOTAL, icon: Users, color: "text-blue-500" },
    { title: "Pending Review", value: metrics.RECEIVED, icon: FileText, color: "text-amber-500" },
    { title: "Approved", value: metrics.APPROVED, icon: CheckCircle, color: "text-green-500" },
    { title: "Rejected", value: metrics.REJECTED, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Operational Dashboard</h1>
        <p className="text-secondary mt-2">Overview of Gather Hub registrations, transport, and merchandise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-secondary">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transport Summary */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bus className="h-5 w-5 text-accent" />
              Approved Transport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary">Taking Bus</div>
                <div className="text-2xl font-bold text-foreground mt-1">{transportStats.bus}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary">Private Car (Mobil)</div>
                <div className="text-2xl font-bold text-foreground mt-1">{transportStats.mobil}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary">Motorcycle</div>
                <div className="text-2xl font-bold text-foreground mt-1">{transportStats.motor}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary">No Transport Selected</div>
                <div className="text-2xl font-bold text-foreground mt-1">{transportStats.none}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merchandise Summary */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" />
              Merchandise Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary">Total Allocated</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">{totalAllocated}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border opacity-50">
                <div className="text-sm text-secondary">Picked Up</div>
                <div className="text-2xl font-bold text-foreground mt-1">0</div>
                <div className="text-[10px] text-muted-foreground mt-1">Phase 06</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border opacity-50">
                <div className="text-sm text-secondary">Remaining</div>
                <div className="text-2xl font-bold text-foreground mt-1">-</div>
                <div className="text-[10px] text-muted-foreground mt-1">Phase 06</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
