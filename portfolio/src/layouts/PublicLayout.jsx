import { Outlet } from "react-router-dom";
import { ScrollProgress } from "./ScrollProgress";
import { Navbar } from "@/features/navbar/Navbar";
import { Footer } from "@/features/footer/Footer";
import { ChatWidget } from "@/features/ai-tools/ChatWidget";

export function PublicLayout() {
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
