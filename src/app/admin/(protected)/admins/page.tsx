import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { Role } from "@/lib/authorization";

export const dynamic = 'force-dynamic';

export default async function AdminManagementPage() {
  const { user: currentUser } = await requirePermission("admins", "read");

  const adminsList = await db.select().from(admins).orderBy(admins.createdAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
        <p className="text-sm text-secondary">Manage administrative access and roles.</p>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-secondary uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminsList.map((admin) => (
                <tr key={admin.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {admin.name} {admin.id === currentUser.id && "(You)"}
                  </td>
                  <td className="px-4 py-3 text-secondary">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      admin.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {admin.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{admin.role}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <AdminUserActions 
                        adminId={admin.id} 
                        isActive={admin.isActive} 
                        currentRole={admin.role as Role}
                        isSelf={admin.id === currentUser.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
