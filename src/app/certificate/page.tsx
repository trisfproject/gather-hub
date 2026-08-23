import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Container } from "@/components/layout/container";

export default function CertificatePage() {
  return (
    <Container className="pt-24 md:pt-32 min-h-screen">
      <Section>
        <SectionHeader 
          title="Certificates" 
          description="Download your digital certificate for attending KOMITKABE Gathering XXVI." 
        />
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-surface shadow-sm">
          <p className="text-muted-foreground text-lg mb-2">Certificates are not yet available.</p>
          <p className="text-sm text-secondary">They will be generated after the event concludes.</p>
        </div>
      </Section>
    </Container>
  );
}
