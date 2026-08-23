import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Container } from "@/components/layout/container";

export default function RegistrationCheckPage() {
  return (
    <Container className="pt-24 md:pt-32 min-h-screen">
      <Section>
        <SectionHeader 
          title="Check Registration" 
          description="Verify your registration status for KOMITKABE Gathering XXVI." 
        />
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-surface shadow-sm">
          <p className="text-muted-foreground text-lg mb-2">Status check system coming soon.</p>
          <p className="text-sm text-secondary">Once registered, you can verify your status here.</p>
        </div>
      </Section>
    </Container>
  );
}
