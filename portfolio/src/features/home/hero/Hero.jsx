import { useGreeting } from "./useGreeting";
import { HeroLeftContent } from "./components/HeroLeftContent";
import { HeroRightVisual } from "./components/HeroRightVisual";
import { HeroLogoMarquee } from "./components/HeroLogoMarquee";

export function Hero() {
  const greeting = useGreeting();

  return (
    <section
      id="top"
      className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="absolute -top-24 -left-24 size-[520px] bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-32 size-[560px] bg-secondary/15 blur-3xl animate-blob [animation-delay:-4s]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <HeroLeftContent greeting={greeting} />
        <HeroRightVisual />
      </div>

      <HeroLogoMarquee />
    </section>
  );
}
