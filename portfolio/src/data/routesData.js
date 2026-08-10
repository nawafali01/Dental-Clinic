/**
 * MOCK DATA FOR ADMIN & DASHBOARD ROUTE VIEWS
 * 
 * Extracted from route definitions to separate presentation/data concerns from routing logic.
 */

// ── Org Admin Data ──────────────────────────────────────────
export const orgSettingsSections = [
  { section: "Organization Profile", items: ["Organization Name", "Logo", "Business Type", "Registration Number"], color: "blue" },
  { section: "Clinics",              items: ["Active Clinics", "Clinic Limit", "Shared Resources", "Inter-clinic Access"], color: "green" },
  { section: "Branding",             items: ["Primary Color", "Secondary Color", "Font Style", "Email Footer"], color: "purple" },
  { section: "Notifications",        items: ["Alert Preferences", "Digest Emails", "Mobile Push", "Escalation Rules"], color: "amber" },
  { section: "Team Access",          items: ["Invite Policy", "Default Role", "Auto-assign Leads", "Access Expiry"], color: "slate" },
  { section: "Data & Privacy",       items: ["Data Retention", "Export Data", "Delete Account", "GDPR Compliance"], color: "red" },
];

// ── Super Admin Data ────────────────────────────────────────
export const analyticsFunnelData = [
  { stage: "New Leads",   count: 1284, pct: 100 },
  { stage: "Contacted",   count: 890,  pct: 69 },
  { stage: "Qualified",   count: 342,  pct: 27 },
  { stage: "Proposal",    count: 134,  pct: 10 },
  { stage: "Converted",   count: 89,   pct: 7 },
];

export const analyticsLeadSourcesData = [
  { source: "Google Ads", leads: 487, color: "bg-blue-500" },
  { source: "Instagram",  leads: 321, color: "bg-pink-500" },
  { source: "Website",    leads: 208, color: "bg-purple-500" },
  { source: "WhatsApp",   leads: 156, color: "bg-green-500" },
  { source: "Referral",   leads: 112, color: "bg-amber-500" },
];

export const aiOpsSystemHealthData = [
  { service: "Lead Processing AI",      status: "Operational", latency: "0.8s",  health: 99 },
  { service: "Appointment Reminder Bot",status: "Operational", latency: "1.1s",  health: 98 },
  { service: "WhatsApp Messaging AI",   status: "Operational", latency: "2.3s",  health: 96 },
  { service: "Lead Scoring Engine",     status: "Degraded",    latency: "5.1s",  health: 72 },
  { service: "Email Campaign AI",       status: "Operational", latency: "1.5s",  health: 99 },
];

export const auditLogsData = [
  { user: "superadmin@test.com",  action: "LOGIN",           resource: "Auth System",   ip: "192.168.1.10", severity: "Info",     timestamp: "Aug 3 — 12:05 PM" },
  { user: "orgadmin@test.com",    action: "UPDATE_LEAD",     resource: "Lead #4829",    ip: "192.168.1.21", severity: "Info",     timestamp: "Aug 3 — 11:48 AM" },
  { user: "manager@test.com",     action: "VIEW_PATIENTS",   resource: "Patient List",  ip: "192.168.1.34", severity: "Info",     timestamp: "Aug 3 — 11:30 AM" },
  { user: "superadmin@test.com",  action: "DELETE_USER",     resource: "User #1120",    ip: "192.168.1.10", severity: "Warning",  timestamp: "Aug 3 — 11:00 AM" },
  { user: "superadmin@test.com",  action: "TOGGLE_AI_KILL",  resource: "AI Ops Panel",  ip: "192.168.1.10", severity: "Critical", timestamp: "Aug 3 — 10:45 AM" },
  { user: "orgadmin@test.com",    action: "EXPORT_REPORT",   resource: "Revenue Report",ip: "192.168.1.21", severity: "Info",     timestamp: "Aug 3 — 10:30 AM" },
  { user: "superadmin@test.com",  action: "CREATE_CLINIC",   resource: "Clinic #005",   ip: "192.168.1.10", severity: "Info",     timestamp: "Aug 3 — 09:15 AM" },
];

// ── Shared Routes Data ──────────────────────────────────────
export const reportsList = [
  { title: "Lead Conversion Report",  desc: "Track leads from source to conversion",  color: "blue",   tag: "CRM" },
  { title: "Monthly Revenue Report",  desc: "Revenue breakdown by clinic and month",  color: "green",  tag: "Finance" },
  { title: "Appointment Summary",     desc: "Appointment trends and no-show rates",   color: "purple", tag: "Operations" },
  { title: "Patient Growth Report",   desc: "New vs returning patient trends",        color: "amber",  tag: "Patients" },
  { title: "AI Performance Report",   desc: "AI automation results and efficiency",   color: "cyan",   tag: "AI" },
  { title: "Staff Activity Report",   desc: "Task completion and team performance",   color: "slate",  tag: "Staff" },
];

export const notificationsList = [
  { title: "New lead assigned",              desc: "Ahmed Al-Rashidi was assigned to you from Google Ads",    time: "5 minutes ago",  dot: "bg-blue-500" },
  { title: "Appointment confirmed",          desc: "Sara Johnson confirmed her appointment for Aug 3, 10:30 AM",time: "20 minutes ago", dot: "bg-green-500" },
  { title: "Payment received",               desc: "Khalid Mansour paid $1,500 via Bank Transfer",           time: "1 hour ago",      dot: "bg-emerald-500" },
  { title: "AI automation completed",        desc: "Lead nurturing sequence ran for 12 leads successfully",  time: "2 hours ago",     dot: "bg-purple-500" },
  { title: "Missed call follow-up needed",   desc: "3 calls were missed this morning and need follow-up",    time: "3 hours ago",     dot: "bg-amber-500" },
  { title: "Monthly report generated",       desc: "July 2026 revenue report is ready to download",         time: "1 day ago",       dot: "bg-slate-400" },
];

export const aiCopilotInitialMessages = [
  { role: "ai",   text: "Hello! I'm your AI Copilot. I can help you analyze leads, draft follow-up messages, summarize reports, and much more. What would you like to do today?" },
  { role: "user", text: "How many leads came in this week?" },
  { role: "ai",   text: "This week you received 47 new leads. Google Ads contributed the most with 18 leads (38%), followed by Instagram with 14 leads (30%), and referrals with 9 leads (19%). Your best performing day was Wednesday with 12 new leads." },
  { role: "user", text: "Which leads need follow-up today?" },
  { role: "ai",   text: "You have 8 leads that need follow-up today. The highest priority is Ahmed Al-Rashidi who was qualified 3 days ago with no contact, followed by 3 leads from last week's Google Ads campaign that haven't been called yet. Would you like me to draft follow-up messages for them?" },
];

export const treatmentsConfigRows = [
  { treatment: "Teeth Cleaning",     category: "Preventive",  duration: "45 min",  price: "$80",    status: "Active", color: "green" },
  { treatment: "Root Canal",         category: "Restorative", duration: "90 min",  price: "$650",   status: "Active", color: "green" },
  { treatment: "Teeth Whitening",    category: "Cosmetic",    duration: "60 min",  price: "$250",   status: "Active", color: "green" },
  { treatment: "Dental Implant",     category: "Surgical",    duration: "120 min", price: "$1,500", status: "Active", color: "green" },
  { treatment: "Orthodontic Consult",category: "Orthodontic", duration: "30 min",  price: "$100",   status: "Active", color: "green" },
  { treatment: "Tooth Extraction",   category: "Surgical",    duration: "30 min",  price: "$150",   status: "Review", color: "amber" },
];

export const leadSourcesRows = [
  { source: "Google Ads",      type: "Paid",     leads: "108", rate: "8.3%",  status: "Active", color: "green" },
  { source: "Instagram",       type: "Social",   leads: "79",  rate: "5.1%",  status: "Active", color: "green" },
  { source: "Website",         type: "Organic",  leads: "52",  rate: "7.7%",  status: "Active", color: "green" },
  { source: "WhatsApp",        type: "Direct",   leads: "28",  rate: "9.2%",  status: "Active", color: "green" },
  { source: "Referral",        type: "Referral", leads: "17",  rate: "11.8%", status: "Active", color: "green" },
  { source: "TV Advertisement",type: "Offline",  leads: "0",   rate: "0%",    status: "Paused", color: "amber" },
];

export const leadStatusesRows = [
  { name: "New",       color: "blue",   order: "1", leads: "156", actions: "Edit / Delete" },
  { name: "Contacted", color: "amber",  order: "2", leads: "89",  actions: "Edit / Delete" },
  { name: "Qualified", color: "purple", order: "3", leads: "67",  actions: "Edit / Delete" },
  { name: "Proposal",  color: "blue",   order: "4", leads: "34",  actions: "Edit / Delete" },
  { name: "Converted", color: "green",  order: "5", leads: "89",  actions: "Edit / Delete" },
  { name: "Lost",      color: "red",    order: "6", leads: "49",  actions: "Edit / Delete" },
];

export const aiRunsRows = [
  { id: "RUN-4829", automation: "Lead Welcome Message",   trigger: "New Lead Created",  duration: "0.8s", status: "Success", color: "green", timestamp: "Aug 3 — 12:05 PM" },
  { id: "RUN-4828", automation: "Appointment Reminder",   trigger: "24h Before Appt",   duration: "1.1s", status: "Success", color: "green", timestamp: "Aug 3 — 11:00 AM" },
  { id: "RUN-4827", automation: "Follow-up Sequence",     trigger: "Lead Inactive 3d",  duration: "2.3s", status: "Warning", color: "amber", timestamp: "Aug 3 — 10:30 AM" },
  { id: "RUN-4826", automation: "Payment Confirmation",   trigger: "Payment Received",  duration: "0.5s", status: "Success", color: "green", timestamp: "Aug 3 — 10:00 AM" },
  { id: "RUN-4825", automation: "Lead Score Update",      trigger: "Scheduled Daily",   duration: "5.1s", status: "Failed",  color: "red",   timestamp: "Aug 3 — 09:00 AM" },
];

export const aiAutomationsRows = [
  { name: "New Lead Welcome",        trigger: "Lead Created",       actions: "Send WhatsApp + Email",    runsToday: "18", status: "Active", color: "green" },
  { name: "Appointment Reminder",    trigger: "24h Before Appt",    actions: "Send SMS + Email",         runsToday: "12", status: "Active", color: "green" },
  { name: "Follow-up Sequence",      trigger: "No Contact 3 Days",  actions: "Send Email → Call Task",   runsToday: "8",  status: "Active", color: "green" },
  { name: "Payment Receipt",         trigger: "Payment Confirmed",  actions: "Send Email + Receipt PDF", runsToday: "9",  status: "Active", color: "green" },
  { name: "Lost Lead Re-engagement", trigger: "Lead Marked Lost",   actions: "Wait 7d → Send Offer",    runsToday: "0",  status: "Paused", color: "amber" },
];

export const websitePagesList = [
  { title: "Homepage",        desc: "Hero, services, testimonials",   status: "Published", tag: "Main" },
  { title: "Services",        desc: "All dental services listing",     status: "Published", tag: "Services" },
  { title: "Doctors",         desc: "Doctor profiles and specialties", status: "Published", tag: "Team" },
  { title: "Book Appointment", desc: "Online booking form & calendar", status: "Published", tag: "Booking" },
  { title: "Blog",            desc: "Dental health articles",          status: "Draft",     tag: "Content" },
  { title: "Contact",         desc: "Contact form and clinic locations",status:"Published", tag: "Contact" },
];

export const leadFormsRows = [
  { name: "Google Ads Landing Page Form", source: "Google Ads", leads: "108", rate: "8.3%",  status: "Active", color: "green" },
  { name: "Instagram Campaign Form",      source: "Instagram",  leads: "79",  rate: "5.1%",  status: "Active", color: "green" },
  { name: "Website Contact Form",         source: "Organic",    leads: "52",  rate: "7.7%",  status: "Active", color: "green" },
  { name: "WhatsApp Opt-in Form",         source: "WhatsApp",   leads: "28",  rate: "9.2%",  status: "Active", color: "green" },
  { name: "Ramadan Offer Form",           source: "Seasonal",   leads: "12",  rate: "12.5%", status: "Paused", color: "amber" },
];

export const integrationsList = [
  { name: "WhatsApp Business", category: "Messaging",  status: "Connected",     color: "green" },
  { name: "Google Ads",        category: "Marketing",  status: "Connected",     color: "green" },
  { name: "Twilio (SMS/Calls)",category: "Telephony",  status: "Connected",     color: "green" },
  { name: "Stripe",            category: "Payments",   status: "Connected",     color: "green" },
  { name: "Google Calendar",   category: "Scheduling", status: "Not Connected", color: "slate" },
  { name: "Mailchimp",         category: "Email",      status: "Not Connected", color: "slate" },
  { name: "Zapier",            category: "Automation", status: "Not Connected", color: "slate" },
  { name: "HubSpot CRM",       category: "CRM",        status: "Coming Soon",   color: "amber" },
  { name: "Salesforce",        category: "CRM",        status: "Coming Soon",   color: "amber" },
];

export const patientCheckInRows = [
  { name: "Ahmed Al-Rashidi", doctor: "Dr. Aisha Khan", arrivalTime: "08:50 AM", status: "In Treatment", color: "green", actionText: "Check Out" },
  { name: "Sara Johnson",    doctor: "Dr. Omar Hassan", arrivalTime: "09:15 AM", status: "Waiting",      color: "amber", actionText: "Call Patient" },
  { name: "Mohammed Hassan", doctor: "Dr. Aisha Khan", arrivalTime: "09:30 AM", status: "Waiting",      color: "amber", actionText: "Call Patient" },
  { name: "Fatima Al-Zaidi", doctor: "Dr. Khalid Nasser", arrivalTime: "09:45 AM", status: "Checked In",   color: "blue",  actionText: "Start Treatment" },
];

export const rescheduleRequestsRows = [
  { patientName: "Sara Johnson",   originalSlot: "Aug 3 — 10:30 AM", requestedSlot: "Aug 5 — 02:00 PM", reason: "Work Conflict",  status: "Pending",    color: "amber" },
  { patientName: "Khalid Mansour", originalSlot: "Aug 4 — 11:00 AM", requestedSlot: "Aug 6 — 10:00 AM", reason: "Doctor Request", status: "Processing", color: "blue" },
];
