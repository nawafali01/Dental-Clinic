import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Globe, HardDrive, Shield } from "lucide-react";

export function SuperAdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/40 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
              <Shield className="text-primary w-6 h-6 animate-pulse" />
              Platform Operations Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, <strong className="text-foreground">{user?.name}</strong> ({user?.email})
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={logout}>
            Sign Out Operations
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-primary mb-3">
              <Globe className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Tenant Clinics</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">147</p>
            <p className="text-xs text-muted-foreground mt-1">Across 12 regional servers</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-secondary mb-3">
              <HardDrive className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Cluster Status</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">99.98%</p>
            <p className="text-xs text-green-600 mt-1">Optimal health (2.4ms API latency)</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <Shield className="w-5 h-5" />
              <h3 className="font-semibold text-sm">System Operations</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">Healthy</p>
            <p className="text-xs text-muted-foreground mt-1">Last sync 14 seconds ago</p>
          </div>
        </div>

        {/* Informative alert box */}
        <div className="bg-card p-8 rounded-2xl border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground font-display">Platform Logbook</h2>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              [SYSTEM OK] 2026-07-21 14:52:00 UTC - Syncing master instance database node cluster 2...<br />
              [RESTORED] 2026-07-21 13:40:02 UTC - API route caching optimized.<br />
              [INFO] 2026-07-21 10:15:30 UTC - Automatic DB schema replication successfully completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
