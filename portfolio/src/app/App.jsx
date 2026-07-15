import { AppRouter } from "@/routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" expand={false} richColors closeButton />
    </>
  );
}
