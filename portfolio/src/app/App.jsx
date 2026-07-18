import { AppRouter } from "@/routes";
import { Toaster } from "sonner";
import { Agentation } from "agentation";

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" expand={false} richColors closeButton />
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}
