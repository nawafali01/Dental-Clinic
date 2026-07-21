import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Button } from "../components/ui/Button";
import { ROLE_LABELS } from "../features/auth/constants/authConstants";
import { Activity, Clock, FileText, CalendarCheck } from "lucide-react";

export function StaffDashboard() {
  const { user, logout } = useAuth();
  
  const roleLabel = ROLE_LABELS[user?.role] || "Clinical Staff";

  return (
    <div className="min-h-screen bg-muted/40 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
              Slot: Active Shift
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-display text-left">
              Role Workstation: {roleLabel}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, <strong className="text-foreground">{user?.name}</strong> ({user?.email})
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            End Workstation Shift
          </Button>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shift Tracker Card */}
          <div className="bg-card p-6 rounded-2xl border border-border flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground text-left">Shift Details</h3>
              <p className="text-2xl font-bold mt-1 text-left">6h 12m</p>
              <p className="text-xs text-muted-foreground mt-1 text-left">Checked in today at 08:40 AM</p>
            </div>
          </div>

          {/* Pending Reviews Card */}
          <div className="bg-card p-6 rounded-2xl border border-border flex items-start gap-4">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground text-left">Assigned Tasks</h3>
              <p className="text-2xl font-bold mt-1 text-left">4 Pending</p>
              <p className="text-xs text-muted-foreground mt-1 text-left">Requires review before shift close</p>
            </div>
          </div>

          {/* Room Allocation */}
          <div className="bg-card p-6 rounded-2xl border border-border flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground text-left">Scheduler Actions</h3>
              <p className="text-2xl font-bold mt-1 text-left">18 bookings</p>
              <p className="text-xs text-muted-foreground mt-1 text-left">AI automation queue active</p>
            </div>
          </div>
        </div>

        {/* Dynamic Context Card based on Role */}
        <div className="bg-card p-8 rounded-2xl border border-border">
          <h2 className="text-lg font-bold text-foreground font-display mb-4 text-left">Portal Operations Info</h2>
          <p className="text-sm text-muted-foreground mb-6 text-left">
            Thank you for checking in. You are connected to Downtown Dental Suite's central local server. All client modifications will automatically propagate to doctor feeds and patient chatbots.
          </p>

          <div className="p-4 rounded-xl bg-muted/65 border border-border flex items-center gap-3">
            <Activity className="text-primary w-5 h-5 animate-pulse-ring rounded-full shrink-0" />
            <div className="text-sm text-muted-foreground text-left">
              <strong>Tip:</strong> Pressing <em>"End Workstation Shift"</em> will clear local cached session logs and sign you out securely.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
