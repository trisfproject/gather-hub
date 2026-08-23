import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Container } from "@/components/layout/container";

export default function NewsPage() {
  return (
    <Container className="pt-24 md:pt-32 min-h-screen">
      <Section>
        <SectionHeader 
          title="Event News" 
          description="Latest updates and announcements for KOMITKABE Gathering XXVI." 
        />
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-surface shadow-sm">
          <p className="text-muted-foreground text-lg mb-2">News system coming soon.</p>
          <p className="text-sm text-secondary">Check back later for updates.</p>
        </div>
      </Section>
    </Container>
  );
}
