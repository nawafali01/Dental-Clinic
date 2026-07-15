import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/site/Navbar";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Hero } from "@/components/site/Hero";
import { AIPreview } from "@/components/site/AIPreview";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { WhyUs } from "@/components/site/WhyUs";
import { Doctors } from "@/components/site/Doctors";
import { Gallery } from "@/components/site/Gallery";
import { AITools } from "@/components/site/AITools";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="bg-background text-foreground selection:bg-primary/20 selection:text-secondary overflow-x-clip">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <AIPreview />
      <About />
      <Services />
      <WhyUs />
      <Doctors />
      <Gallery />
      <AITools />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
      <ChatWidget />
      <Toaster position="bottom-left" />
    </main>
  );
}