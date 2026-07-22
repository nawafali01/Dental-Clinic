import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";
import beforeImg from "@/assets/images/gallery-1.jpg";
import afterImg from "@/assets/images/gallery-2.jpg";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  return (
    <div className="mt-14 rounded-[32px] bg-white border border-border p-6 md:p-8 soft-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent text-primary text-xs font-semibold px-3 py-1 border border-primary/15">
            <Sparkles className="size-3.5" /> Interactive Smile Transformation
          </span>
          <h3 className="mt-2 font-display text-2xl font-semibold text-secondary">
            Porcelain Atelier Veneers & Alignment
          </h3>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          Drag the handle left or right to compare pre-treatment alignment with final porcelain restoration results.
        </p>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative h-[320px] md:h-[440px] rounded-3xl overflow-hidden select-none cursor-ew-resize border border-border group"
      >
        <img
          src={afterImg}
          alt="After treatment smile transformation"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <span className="absolute top-4 right-4 glass rounded-full px-3.5 py-1 text-xs font-semibold text-white bg-secondary/80 z-10">
          After Transformation
        </span>

        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImg}
            alt="Before treatment initial smile"
            className="absolute inset-0 w-full h-full object-cover max-w-none group-hover:scale-105 transition-transform duration-700 ease-out"
            style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
          />
          <span className="absolute top-4 left-4 glass rounded-full px-3.5 py-1 text-xs font-semibold text-secondary bg-white/90 z-10">
            Initial State
          </span>
        </div>

        <div
          className="absolute inset-y-0 z-20 flex items-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="h-full w-0.5 bg-white shadow-lg" />
          <div className="-ml-4 size-8 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-xl border-2 border-white cursor-ew-resize hover:scale-110 transition-transform">
            <MoveHorizontal className="size-4" />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-6">
          <p>
            <span className="font-semibold text-secondary">Case:</span> Full Upper Smile Rehabilitation
          </p>
          <p>
            <span className="font-semibold text-secondary">Duration:</span> 3 Visits over 2 Weeks
          </p>
          <p className="hidden sm:block">
            <span className="font-semibold text-secondary">Clinician:</span> Dr. Marcus Thorne
          </p>
        </div>
        <a
          href="#contact"
          className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          Book Similar Transformation →
        </a>
      </div>
    </div>
  );
}
