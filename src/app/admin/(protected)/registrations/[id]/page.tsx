import { requirePermission } from "@/lib/authorization";
import { db } from "@/db";
import { 
  registrations, 
  participants, 
  professionalProfiles, 
  transportProfiles, 
  departureProfiles, 
  merchandisePreferences, 
  registrationConsents 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationReviewActions } from "@/components/admin/registration-review-actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminRegistrationDetailPage(props: { params: Promise<{ id: string }> }) {
  const { user } = await requirePermission("registrations", "read");
  const params = await props.params;

  const [registrationData] = await db
    .select()
    .from(registrations)
    .innerJoin(participants, eq(registrations.participantId, participants.id))
    .leftJoin(professionalProfiles, eq(participants.id, professionalProfiles.participantId))
    .leftJoin(transportProfiles, eq(participants.id, transportProfiles.participantId))
    .leftJoin(departureProfiles, eq(participants.id, departureProfiles.participantId))
    .leftJoin(merchandisePreferences, eq(participants.id, merchandisePreferences.participantId))
    .leftJoin(registrationConsents, eq(participants.id, registrationConsents.participantId))
    .where(eq(registrations.id, params.id))
    .limit(1);

  if (!registrationData) {
    notFound();
  }

  const { 
    registrations: reg, 
    participants: participant,
    professional_profiles: prof,
    transport_profiles: transport,
    departure_profiles: departure,
    merchandise_preferences: merch,
    registration_consents: consent 
  } = registrationData;

  const canApprove = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "COMMITTEE";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/registrations">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">{reg.registrationId}</h1>
          <p className="text-sm text-secondary">Registered at: {new Date(reg.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' :
            reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
            reg.status === 'RECEIVED' ? 'bg-amber-500/10 text-amber-600' :
            'bg-gray-500/10 text-gray-600'
          }`}>
            {reg.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-lg">Participant Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Full Name" value={participant.fullName} />
              <DetailItem label="Email" value={participant.email} />
              <DetailItem label="WhatsApp" value={participant.whatsapp} />
              <DetailItem label="Telegram" value={participant.telegramUsername || '-'} />
              <DetailItem label="City/Regency" value={participant.cityRegency} />
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-lg">Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Company" value={prof?.companyName} />
              <DetailItem label="Industrial Area" value={prof?.industrialArea} />
              {prof?.industrialAreaOther && (
                <DetailItem label="Specific Area" value={prof.industrialAreaOther} />
              )}
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-lg">Transportation & Departure</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Taking Bus?" value={transport?.takeBus ? 'Yes' : 'No'} />
              {transport?.takeBus && (
                <DetailItem label="Pickup Point ID" value={transport.pickupPointId} />
              )}
              {!transport?.takeBus && (
                <>
                  <DetailItem label="Vehicle Type" value={transport?.vehicleType} />
                  {transport?.vehicleType === 'MOBIL' && (
                    <>
                      <DetailItem label="License Plate" value={transport.licensePlate} />
                      <DetailItem label="Car Rows" value={transport.carRows?.toString()} />
                      <DetailItem label="Available Seats" value={transport.availableSeats?.toString()} />
                    </>
                  )}
                </>
              )}
              <div className="col-span-full border-t border-border my-2 pt-4" />
              <DetailItem label="Departure Area" value={departure?.departureArea} />
              <DetailItem label="Departure Detail" value={departure?.departureDetail || '-'} />
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-lg">Other Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Merchandise Size" value={merch?.shirtSize || 'NONE'} />
              <DetailItem label="Invitation Requested" value={consent?.invitationRequested ? 'Yes' : 'No'} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Action Panel */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-lg">Registration Review</CardTitle>
            </CardHeader>
            <CardContent>
              {reg.status === 'RECEIVED' ? (
                canApprove ? (
                  <RegistrationReviewActions registrationId={reg.id} />
                ) : (
                  <p className="text-sm text-secondary">You do not have permission to approve or reject registrations.</p>
                )
              ) : (
                <div className="p-4 bg-background border border-border rounded-md text-sm text-secondary">
                  This registration is currently <strong className="text-foreground">{reg.status}</strong> and cannot be reviewed.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div>
      <div className="text-xs font-medium text-secondary uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm text-foreground">{value || '-'}</div>
    </div>
  );
}
