import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import heroImg from "@/assets/images/hero-dentist.jpg";
import toothImg from "@/assets/images/tooth-3d.png";

export function HeroRightVisual() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-40, 40], [6, -6]), {
    stiffness: 120,
    damping: 15,
  });
  const ry = useSpring(useTransform(mx, [-40, 40], [-6, 6]), {
    stiffness: 120,
    damping: 15,
  });

  return (
    <div
      className="lg:col-span-5 relative"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="relative"
      >
        <div className="relative rounded-[36px] overflow-hidden soft-shadow border border-white/60 bg-white">
          <img
            src={heroImg}
            alt="Dentist at Aurea Dental smiling in a modern clinic"
            width={1200}
            height={1400}
            className="w-full h-[480px] md:h-[560px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/25 via-transparent to-transparent" />
        </div>

        {/* Floating stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="absolute -left-4 md:-left-10 top-16 glass soft-shadow rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-slow"
        >
          <span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground font-display">
              AI Smile Score
            </p>
            <p className="font-semibold text-secondary font-display">
              96 / 100
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="absolute -right-3 md:-right-8 bottom-14 glass soft-shadow rounded-2xl px-4 py-3 animate-float-slow [animation-delay:-3s]"
        >
          <p className="text-xs text-muted-foreground font-display">
            Next opening
          </p>
          <p className="font-semibold text-secondary font-display">
            Today · 3:40 PM
          </p>
          <p className="text-xs text-primary mt-0.5 font-display font-medium">
            Dr. Elena Marsh
          </p>
        </motion.div>

        <motion.img
          src={toothImg}
          alt=""
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="hidden md:block absolute -bottom-10 -left-14 size-40 animate-float-slow [animation-delay:-2s] drop-shadow-[0_20px_40px_rgba(31,138,112,0.25)]"
        />
      </motion.div>
    </div>
  );
}
