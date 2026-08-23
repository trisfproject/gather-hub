import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Container } from "@/components/layout/container";

export default function RegisterPage() {
  return (
    <Container className="pt-24 md:pt-32 min-h-screen">
      <Section>
        <SectionHeader 
          title="Register" 
          description="Secure your spot for the next chapter of KOMITKABE Gathering." 
        />
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-surface shadow-sm">
          <p className="text-muted-foreground text-lg mb-2">Registration opens soon.</p>
          <p className="text-sm text-secondary">Stay tuned for the official announcement.</p>
        </div>
      </Section>
    </Container>
  );
}
