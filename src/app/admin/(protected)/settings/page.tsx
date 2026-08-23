import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { eventSettings } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SettingToggle } from "@/components/admin/setting-toggle";

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const { user } = await requirePermission("event", "read");
  
  // Can they actually change it?
  const canManage = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

  const dbSettings = await db.select().from(eventSettings).limit(1);
  const record = dbSettings[0] || {};
  
  const settingsMap = new Map([
    ["registration_enabled", String(record.registrationEnabled ?? false)],
    ["bus_enabled", String(record.busEnabled ?? false)],
    ["merchandise_enabled", String(record.merchandiseEnabled ?? false)],
    ["invitation_enabled", String(record.invitationEnabled ?? false)],
    ["certificate_enabled", String(record.certificateEnabled ?? false)],
    ["telegram_enabled", String(record.telegramEnabled ?? false)],
    ["whatsapp_enabled", String(record.whatsappEnabled ?? false)],
  ]);

  const featureFlags = [
    { key: "registration_enabled", label: "Registration Open", description: "Allow new participants to register." },
    { key: "bus_enabled", label: "Bus Transportation", description: "Show bus selection during registration." },
    { key: "merchandise_enabled", label: "Merchandise Selection", description: "Show shirt size selection during registration." },
    { key: "invitation_enabled", label: "Invitation Requests", description: "Allow participants to request a formal PDF invitation." },
    { key: "certificate_enabled", label: "Certificate Generation", description: "Enable e-certificate generation for participants." },
    { key: "telegram_enabled", label: "Telegram Integration", description: "Ask for Telegram username during registration." },
    { key: "whatsapp_enabled", label: "WhatsApp Notifications", description: "Enable sending WhatsApp messages." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Event Settings</h1>
        <p className="text-sm text-secondary">Configure feature flags and global event behavior.</p>
      </div>

      <Card className="bg-surface border-border max-w-3xl">
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Enable or disable specific modules of the Gather Hub application.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {featureFlags.map((flag) => (
            <SettingToggle 
              key={flag.key}
              settingKey={flag.key}
              label={flag.label}
              description={flag.description}
              initialValue={settingsMap.get(flag.key) || "false"}
              disabled={!canManage}
            />
          ))}
          {!canManage && (
            <p className="pt-4 text-sm text-amber-500">
              You do not have permission to modify these settings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
