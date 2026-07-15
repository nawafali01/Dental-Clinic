import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="grid place-items-center size-16 rounded-3xl bg-primary/10 text-primary mx-auto">
          <Sparkles className="size-8" />
        </span>
        <h1 className="mt-8 font-display text-7xl md:text-9xl font-semibold text-secondary leading-none">
          404
        </h1>
        <p className="mt-4 text-muted-foreground max-w-sm mx-auto leading-relaxed">
          This page has wandered off. Let us guide you back to a brighter smile.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 h-12 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Aurea
        </Link>
      </motion.div>
    </div>
  );
}
