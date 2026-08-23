import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Container } from "@/components/layout/container";
import { RegistrationForm } from "@/components/registration/registration-form";
import { db } from "@/db";
import { eventSettings } from "@/db/schema";
import { FadeIn } from "@/components/ui/fade-in";

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const [settings] = await db.select().from(eventSettings).limit(1);
  const isOpen = settings?.registrationEnabled ?? false;

  return (
    <Container className="pt-24 md:pt-32 min-h-screen">
      <Section>
        <FadeIn>
          <SectionHeader
            title="Register"
            description="Secure your spot for the next chapter of KOMITKABE Gathering."
            align="center"
          />
        </FadeIn>

        {isOpen ? (
          <RegistrationForm
            busEnabled={settings?.busEnabled ?? false}
            merchandiseEnabled={settings?.merchandiseEnabled ?? false}
            invitationEnabled={settings?.invitationEnabled ?? false}
          />
        ) : (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-24 text-center border border-border rounded-xl bg-surface shadow-sm max-w-2xl mx-auto">
              <p className="text-foreground font-semibold text-2xl mb-3">Registration is currently closed.</p>
              <p className="text-base text-secondary">Stay tuned for official announcements from the committee regarding ticket availability.</p>
            </div>
          </FadeIn>
        )}
      </Section>
    </Container>
  );
}
