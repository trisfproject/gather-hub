import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { pickupPoints } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PickupPointForm, PickupPointToggle } from "@/components/admin/pickup-point-form";
import { desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function AdminPickupPointsPage() {
  const { user } = await requirePermission("pickup_points", "read");
  const canManage = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const points = await db.select().from(pickupPoints).orderBy(desc(pickupPoints.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pickup Points</h1>
        <p className="text-sm text-secondary">Manage bus pickup locations for participants.</p>
      </div>

      {canManage && (
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-base">Add New Pickup Point</CardTitle>
          </CardHeader>
          <CardContent>
            <PickupPointForm />
          </CardContent>
        </Card>
      )}

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-secondary uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {points.map((point) => (
                <tr key={point.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{point.name}</td>
                  <td className="px-4 py-3 text-secondary">{point.locationDetail || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      point.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {point.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PickupPointToggle id={point.id} isActive={point.isActive} disabled={!canManage} />
                  </td>
                </tr>
              ))}
              {points.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-secondary">
                    No pickup points configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
