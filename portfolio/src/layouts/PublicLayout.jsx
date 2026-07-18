import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ScrollProgress } from "./ScrollProgress";
import { Navbar } from "@/features/navbar/Navbar";
import { Footer } from "@/features/footer/Footer";
import { ChatWidget } from "@/features/ai-tools/ChatWidget";

export function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative selection:bg-primary/20 selection:text-primary">
      <ScrollProgress />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
