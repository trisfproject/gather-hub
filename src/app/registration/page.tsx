import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export default function RegistrationCheckPage() {
  return (
    <Container className="pt-24 md:pt-32 min-h-screen">
      <Section>
        <FadeIn>
          <SectionHeader
            title="Check Registration"
            description="Verify your registration status for KOMITKABE Gathering XXVI."
            align="center"
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="max-w-md mx-auto py-12 px-6 border border-border rounded-xl bg-surface shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Look up your status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Registration ID</label>
                <input disabled className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm opacity-50" placeholder="GATH-XXVI-XXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <input disabled className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm opacity-50" placeholder="john@example.com" />
              </div>
              <Button disabled className="w-full mt-4">Lookup Status (Coming Soon)</Button>
            </div>
          </div>
        </FadeIn>
      </Section>
    </Container>
  );
}
