import { useEffect } from "react";
import { AppRouter } from "@/routes";
import { Toaster } from "sonner";
import { Agentation } from "agentation";
import { storageService } from "@/services/storage.service";

export default function App() {
  useEffect(() => {
    storageService.seed();
  }, []);

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" expand={false} richColors closeButton />
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}
