import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, FileText } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Authorization boundary
  await requirePermission("dashboard", "read");

  // Fetch metrics in a single query for performance
  const metricsQuery = await db.select({
    status: registrations.status,
    count: sql<number>`count(*)`.mapWith(Number),
  }).from(registrations).groupBy(registrations.status);

  const metrics = metricsQuery.reduce((acc, curr) => {
    acc[curr.status] = curr.count;
    acc.TOTAL += curr.count;
    return acc;
  }, { TOTAL: 0, RECEIVED: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0, CHECKED_IN: 0 } as Record<string, number>);

  const statCards = [
    { title: "Total Registrations", value: metrics.TOTAL, icon: Users, color: "text-blue-500" },
    { title: "Pending Review", value: metrics.RECEIVED, icon: FileText, color: "text-amber-500" },
    { title: "Approved", value: metrics.APPROVED, icon: CheckCircle, color: "text-green-500" },
    { title: "Rejected", value: metrics.REJECTED, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-secondary mt-2">Overview of Gather Hub registrations and activity.</p>
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

      {metrics.TOTAL === 0 && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-lg bg-surface/50 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No registrations yet</h3>
          <p className="text-secondary max-w-sm mt-2">
            When participants start registering, their metrics will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
