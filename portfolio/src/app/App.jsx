import { useEffect } from "react";
import { AppRouter } from "@/routes";
import { Toaster } from "sonner";
import { Agentation } from "agentation";
import { storageService } from "@/services/storage.service";
import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/dashboard/shared/context/RoleContext";
import { OrgProvider } from "@/dashboard/shared/context/OrgContext";
import { ClinicProvider } from "@/context/ClinicContext";

export default function App() {
  useEffect(() => {
    storageService.seed();
  }, []);

  return (
    <AuthProvider>
      <RoleProvider>
        <OrgProvider>
          <ClinicProvider>
            <AppRouter />
            <Toaster position="top-right" expand={false} richColors closeButton />
            {import.meta.env.DEV && <Agentation />}
          </ClinicProvider>
        </OrgProvider>
      </RoleProvider>
    </AuthProvider>
  );
}
