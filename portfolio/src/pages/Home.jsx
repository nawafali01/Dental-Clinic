import { Hero } from "@/features/home/hero/Hero";
import { TreatmentFinder } from "@/features/home/treatment-finder/TreatmentFinder";
import { Services } from "@/features/home/services/Services";
import { ClinicLocator } from "@/features/home/clinic-locator/ClinicLocator";
import { LiveSlotFinder } from "@/features/home/live-slots/LiveSlotFinder";
import { WhyUs } from "@/features/home/why-us/WhyUs";
import { Gallery } from "@/features/home/gallery/Gallery";
import { AISection } from "@/features/home/ai-tools/AISection";
import { FAQSection } from "@/features/home/faq/FAQSection";
import { Testimonials } from "@/features/home/testimonials/Testimonials";
import { Contact } from "@/features/home/contact/Contact";
import { CookieConsent } from "@/features/footer/CookieConsent";

export default function Home() {
  return (
    <>
      <Hero />
      <TreatmentFinder />
      <Services />
      <ClinicLocator />
      <LiveSlotFinder />
      <WhyUs />
      <Gallery />
      <AISection />
      <FAQSection />
      <Testimonials />
      <Contact />
      <CookieConsent />
    </>
  );
}
