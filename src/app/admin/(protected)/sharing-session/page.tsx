import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { sharingSessions } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminSharingSessionPage() {
  const { user } = await requirePermission("sharing_session", "read");
  const canManage = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "COMMITTEE";

  const sessions = await db.select().from(sharingSessions).limit(1);
  const session = sessions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sharing Session</h1>
          <p className="text-sm text-secondary">Manage the active sharing session for the event.</p>
        </div>
      </div>

      <Card className="bg-surface border-border max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Session</CardTitle>
          {canManage && (
            <Button variant="outline" size="sm" disabled>Edit Session</Button>
          )}
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-secondary uppercase">Topic</div>
                <div className="text-sm text-foreground font-medium">{session.title}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-secondary uppercase">Speaker Name</div>
                  <div className="text-sm text-foreground">{session.speakerName}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-secondary uppercase">Speaker Role</div>
                  <div className="text-sm text-foreground">{session.speakerRole}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-secondary uppercase">Speaker Company</div>
                  <div className="text-sm text-foreground">{session.speakerCompany}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-secondary uppercase">Description</div>
                <div className="text-sm text-foreground whitespace-pre-wrap mt-1">{session.description || '-'}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-secondary">
              <p>No sharing session configured.</p>
              {canManage && (
                <Button variant="primary" className="mt-4" disabled>Create Session</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
