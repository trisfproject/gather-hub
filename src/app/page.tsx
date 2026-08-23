import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden border-b border-border bg-background">
        {/* Abstract geometric background representation */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <Container className="relative z-10 pt-20">
          <FadeIn>
            <div className="max-w-4xl">
              <span className="inline-block text-accent font-semibold tracking-wider text-sm md:text-base uppercase mb-6">
                KOMITKABE Gathering XXVI
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-8 text-foreground">
                TWO DECADES,<br />
                <span className="text-muted-foreground">THE NEXT CHAPTER</span>
              </h1>
              <p className="text-xl md:text-2xl text-secondary max-w-2xl leading-relaxed mb-10">
                Celebrating Our Journey, Shaping What Comes Next.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base">
                    Register Now
                  </Button>
                </Link>
                <Link href="#journey">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                    Discover Our Story
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* 2. JOURNEY / TWO DECADES */}
      <Section id="journey" className="bg-surface">
        <Container>
          <FadeIn>
            <SectionHeader 
              title="A Journey of Evolution" 
              description="From synergy to connection, we reflect on the milestones that brought us here."
            />
          </FadeIn>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="flex flex-col border-l-2 border-border pl-6 py-2">
                <span className="text-muted-foreground font-medium mb-2">2024</span>
                <h3 className="text-xl font-bold">SYNERGY</h3>
                <p className="text-secondary mt-2 text-sm">Building the foundation of collective strength.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-col border-l-2 border-border pl-6 py-2">
                <span className="text-muted-foreground font-medium mb-2">2025</span>
                <h3 className="text-xl font-bold">CONNECT, COLLABORATE & ELEVATE</h3>
                <p className="text-secondary mt-2 text-sm">Expanding our reach and growing together.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-col border-l-2 border-accent pl-6 py-2 bg-accent/5 -ml-[2px] rounded-r-lg">
                <span className="text-accent font-bold mb-2">2026</span>
                <h3 className="text-2xl font-bold">TWO DECADES, THE NEXT CHAPTER</h3>
                <p className="text-foreground mt-2 text-sm font-medium">Looking forward to a new era of industrial IT.</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </Section>

      {/* 3. NEXT CHAPTER */}
      <Section className="bg-foreground text-background">
        <Container>
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-8">20 years is a milestone, not a destination.</h2>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-8">
                We are transitioning from building connections to architecting the future. 
                This gathering is about regenerating our community, embracing maturity, 
                and laying the groundwork for the innovators of tomorrow.
              </p>
              <p className="text-accent font-medium tracking-wide uppercase">The legacy continues.</p>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* 4. SHARING SESSION */}
      <Section className="bg-surface">
        <Container>
          <FadeIn>
            <SectionHeader 
              title="Sharing Session" 
              description="Gain insights from industry leadership as we discuss the path forward."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card className="max-w-2xl bg-background border-border">
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-32 h-32 rounded-full bg-border flex-shrink-0" />
                <div>
                  <div className="text-sm text-accent font-medium uppercase mb-2">Keynote Speaker</div>
                  <h3 className="text-2xl font-bold mb-1">[Speaker Name]</h3>
                  <p className="text-muted-foreground mb-4">[Job Title] at [Company]</p>
                  <p className="text-secondary">
                    &quot;[Topic Title Placeholder] - A deep dive into the technological shifts shaping our industrial community.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </Container>
      </Section>

      {/* 5. EVENT UPDATES */}
      <Section className="bg-background">
        <Container>
          <FadeIn>
            <SectionHeader 
              title="Event Updates" 
            />
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <StaggerItem key={i}>
                <Card className="h-full hover:border-accent transition-colors cursor-pointer group">
                  <div className="h-48 bg-border w-full rounded-t-xl group-hover:opacity-90 transition-opacity" />
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-accent px-2 py-1 bg-accent/10 rounded-md">Category</span>
                      <span className="text-xs text-muted-foreground">Oct {i + 10}, 2026</span>
                    </div>
                    <CardTitle className="text-lg">Update Article Title Placeholder {i}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      A short excerpt describing the news update. This content will be dynamically loaded from the database in a future phase.
                    </CardDescription>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <FadeIn delay={0.3} className="mt-10 text-center">
            <Link href="/news">
              <Button variant="outline">View All Updates</Button>
            </Link>
          </FadeIn>
        </Container>
      </Section>

      {/* 6. LOCATION */}
      <Section className="bg-surface">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Location & Venue</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">[Venue Name]</h3>
                    <p className="text-secondary">[Venue Full Address Line 1]<br/>[City, Region, Postal Code]</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Date & Time</h3>
                    <p className="text-secondary">[Event Date, e.g., November 20, 2026]<br/>[Time, e.g., 08:00 AM - 05:00 PM]</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="aspect-video w-full bg-border rounded-xl flex items-center justify-center text-muted-foreground">
                [Interactive Map Placeholder]
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* 7. REGISTRATION INVITATION */}
      <Section className="bg-accent text-accent-foreground py-24 md:py-32">
        <Container>
          <FadeIn>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Be part of the next chapter.</h2>
              <p className="text-lg md:text-xl opacity-90 mb-10">
                Join us as we celebrate two decades of community and shape the future of our industry together.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-background text-foreground hover:bg-surface text-lg px-10 h-14">
                  Register for Gathering XXVI
                </Button>
              </Link>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </div>
  );
}
