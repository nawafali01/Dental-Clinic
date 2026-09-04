import React from 'react';
import { Bell, Mail, Moon, Clock, ShieldAlert, Sparkles, CheckCircle, Smartphone } from 'lucide-react';

export const TabNotificationsPreferences = ({
  formData,
  onChange,
}) => {
  const inApp = formData?.inApp || {};
  const email = formData?.email || {};
  const quietHours = formData?.quietHours || {};

  const handleInAppToggle = (key) => {
    onChange('inApp', {
      ...inApp,
      [key]: !inApp[key],
    });
  };

  const handleEmailToggle = (key) => {
    onChange('email', {
      ...email,
      [key]: !email[key],
    });
  };

  const handleQuietHoursChange = (field, value) => {
    onChange('quietHours', {
      ...quietHours,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. In-App Notification Alerts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">In-App Live Alerts & Banners</h3>
            <p className="text-xs text-slate-500">Real-time notification toast and badge popups inside the CRM workspace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* New Lead */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">New Patient Lead Captured</span>
              <p className="text-[11px] text-slate-500">Triggered on website form submissions and meta ad leads.</p>
            </div>
            <button
              type="button"
              onClick={() => handleInAppToggle('newLead')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                inApp.newLead ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inApp.newLead ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Appointment Booked */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Appointment Scheduled & Confirmed</span>
              <p className="text-[11px] text-slate-500">Instant notification when a calendar slot is reserved.</p>
            </div>
            <button
              type="button"
              onClick={() => handleInAppToggle('appointmentBooked')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                inApp.appointmentBooked ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inApp.appointmentBooked ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Emergency Cancellation */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Emergency & Same-Day Cancellations</span>
              <p className="text-[11px] text-slate-500">Alerts staff to immediately fill open chair slots.</p>
            </div>
            <button
              type="button"
              onClick={() => handleInAppToggle('emergencyCancelled')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                inApp.emergencyCancelled ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inApp.emergencyCancelled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* AI Copilot Suggestion */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                AI Copilot Smart Recommendations
                <Sparkles className="w-3 h-3 text-amber-500" />
              </span>
              <p className="text-[11px] text-slate-500">High-intent lead re-engagement and call follow-up tips.</p>
            </div>
            <button
              type="button"
              onClick={() => handleInAppToggle('aiCopilotAlert')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                inApp.aiCopilotAlert ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inApp.aiCopilotAlert ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Patient Check-In */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40 md:col-span-2">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Patient Waiting Room Check-In</span>
              <p className="text-[11px] text-slate-500">Notifies clinicians and dental assistants when a patient marks attendance at the kiosk.</p>
            </div>
            <button
              type="button"
              onClick={() => handleInAppToggle('patientCheckIn')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                inApp.patientCheckIn ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inApp.patientCheckIn ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Email Notifications & Digests */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Email Alerts & Performance Digests</h3>
            <p className="text-xs text-slate-500">Automated staff summaries delivered directly to operational inboxes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Morning Briefing */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Daily Morning Briefing (08:00 AM)</span>
              <p className="text-[11px] text-slate-500">Upcoming day schedule, chair occupancy, and VIP patient notes.</p>
            </div>
            <button
              type="button"
              onClick={() => handleEmailToggle('dailyBriefing')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                email.dailyBriefing ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  email.dailyBriefing ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High-Value Inquiry */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">High-Value Treatment Inquiries ($2,000+)</span>
              <p className="text-[11px] text-slate-500">Immediate alert for dental implants, all-on-4, and full restorations.</p>
            </div>
            <button
              type="button"
              onClick={() => handleEmailToggle('highValueInquiry')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                email.highValueInquiry ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  email.highValueInquiry ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Weekly KPI Digest */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Weekly Executive KPI Digest</span>
              <p className="text-[11px] text-slate-500">Summary of total pipeline revenue, show-rate %, and call conversions.</p>
            </div>
            <button
              type="button"
              onClick={() => handleEmailToggle('weeklyKpiDigest')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                email.weeklyKpiDigest ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  email.weeklyKpiDigest ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* System & Security Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Security & Integration Warnings</span>
              <p className="text-[11px] text-slate-500">Failed webhook deliveries, API key errors, or suspicious logins.</p>
            </div>
            <button
              type="button"
              onClick={() => handleEmailToggle('systemAlerts')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                email.systemAlerts ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  email.systemAlerts ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quiet Hours Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Quiet Hours Automation</h3>
              <p className="text-xs text-slate-500">Mutes non-critical staff push and email notifications outside operational hours.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleQuietHoursChange('enabled', !quietHours.enabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              quietHours.enabled ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                quietHours.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {quietHours.enabled && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Quiet Hours Start Time
                </label>
                <input
                  type="time"
                  value={quietHours.startTime || '21:00'}
                  onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Quiet Hours End Time
                </label>
                <input
                  type="time"
                  value={quietHours.endTime || '07:30'}
                  onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Timezone Context</label>
                <input
                  type="text"
                  readOnly
                  value={quietHours.timezone || 'America/New_York (UTC-5)'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Emergency Bypass */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-amber-900">Emergency Patient Priority Bypass</span>
                  <p className="text-[11px] text-amber-700">
                    Always notify on-call clinicians for acute tooth trauma or critical post-operative inquiries regardless of quiet hours.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuietHoursChange('emergencyBypass', !quietHours.emergencyBypass)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  quietHours.emergencyBypass ? 'bg-amber-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    quietHours.emergencyBypass ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
