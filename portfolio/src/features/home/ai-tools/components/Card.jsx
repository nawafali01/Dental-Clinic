import { motion } from "framer-motion";

export function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className={`rounded-3xl bg-white border border-border p-6 md:p-7 soft-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}
