import { Hero } from "@/features/hero/Hero";
import { Services } from "@/features/services/Services";
import { About } from "@/features/about/About";
import { WhyUs } from "@/features/why-us/WhyUs";
import { Doctors } from "@/features/doctors/Doctors";
import { Gallery } from "@/features/gallery/Gallery";
import { AISection } from "@/features/ai-tools/AISection";
import { Testimonials } from "@/features/testimonials/Testimonials";
import { Contact } from "@/features/contact/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <WhyUs />
      <Doctors />
      <Gallery />
      <AISection />
      <Testimonials />
      <Contact />
    </>
  );
}
