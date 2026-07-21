import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Users, Calendar, Activity, ClipboardList } from "lucide-react";

export function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/40 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
              <ClipboardList className="text-primary w-6 h-6" />
              Practice Admin Workstation
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Clinic Site: <strong className="text-foreground">Downtown Dental Suite</strong> &bull; Administrator: <strong className="text-foreground">{user?.name}</strong>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign Out Admin Portal
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-primary mb-3">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Patients</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">2,450</p>
            <p className="text-xs text-green-600 mt-1">+18 new accounts this week</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-secondary mb-3">
              <Calendar className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Today's Visits</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">34</p>
            <p className="text-xs text-muted-foreground mt-1">8 walk-ins, 26 scheduled</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Staff Logged In</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">8 / 12</p>
            <p className="text-xs text-muted-foreground mt-1">Active sessions on duty</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <Activity className="w-5 h-5" />
              <h3 className="font-semibold text-sm">AI Agent Handlers</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">Active</p>
            <p className="text-xs text-green-600 mt-1">Auto-booking enabled</p>
          </div>
        </div>

        {/* Detailed Clinic Operations Panel */}
        <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">Active Operations</h2>
            <p className="text-sm text-muted-foreground mt-1 text-left">
              Real-time feed of clinician, assistant, and scheduler status at Downtown Dental Suite.
            </p>
          </div>
          
          <div className="divide-y divide-border">
            <div className="py-3 flex justify-between text-sm">
              <span className="font-medium text-foreground">Treatment Room A (Restorative)</span>
              <span className="text-green-600 font-semibold px-2 py-0.5 rounded-full bg-green-50 text-xs">Occupied / Dr. Al-Faisal</span>
            </div>
            <div className="py-3 flex justify-between text-sm">
              <span className="font-medium text-foreground">Treatment Room B (Hygiene)</span>
              <span className="text-green-600 font-semibold px-2 py-0.5 rounded-full bg-green-50 text-xs">Occupied / Hygienist Layla</span>
            </div>
            <div className="py-3 flex justify-between text-sm">
              <span className="font-medium text-foreground">Treatment Room C (Surgery)</span>
              <span className="text-muted-foreground px-2 py-0.5 rounded-full bg-muted text-xs">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
