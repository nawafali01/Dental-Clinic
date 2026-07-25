import { 
  Users, 
  PhoneCall, 
  CalendarCheck, 
  CheckCircle, 
  DollarSign,
  Activity,
  AlertTriangle
} from 'lucide-react';

export const managerKpis = [
  {
    id: 'leads_today',
    title: 'New Leads Today',
    value: '24',
    change: '+3',
    isPositive: true,
    period: 'vs yesterday',
    category: 'Leads',
    sparkline: [5, 8, 12, 18, 22, 24],
    icon: Users
  },
  {
    id: 'contact_rate',
    title: 'AI Contact Rate',
    value: '92%',
    change: '+1.5%',
    isPositive: true,
    period: 'vs yesterday',
    category: 'Conversion',
    sparkline: [85, 88, 89, 91, 91.5, 92],
    icon: PhoneCall
  },
  {
    id: 'appointments_booked',
    title: 'Appts Booked',
    value: '18',
    change: '+4',
    isPositive: true,
    period: 'vs yesterday',
    category: 'Conversion',
    sparkline: [4, 6, 9, 12, 15, 18],
    icon: CalendarCheck
  },
  {
    id: 'revenue_today',
    title: 'Collected Today',
    value: '$8,450',
    change: '+$1,200',
    isPositive: true,
    period: 'vs yesterday',
    category: 'Financial',
    sparkline: [2000, 3500, 4800, 6200, 7500, 8450],
    icon: DollarSign
  }
];

export const managerAppointments = [
  { id: 'apt_1', patient: 'Sarah Jenkins', type: 'Consultation - Implant', time: '09:00 AM', status: 'arrived', provider: 'Dr. Smith' },
  { id: 'apt_2', patient: 'Michael Chang', type: 'Routine Cleaning', time: '09:30 AM', status: 'scheduled', provider: 'Hygienist Lee' },
  { id: 'apt_3', patient: 'Emma Roberts', type: 'Invisalign Follow-up', time: '10:00 AM', status: 'scheduled', provider: 'Dr. Patel' },
  { id: 'apt_4', patient: 'David Miller', type: 'Emergency - Pain', time: '11:00 AM', status: 'scheduled', provider: 'Dr. Smith' }
];

export const managerTeam = [
  { id: 'tm_1', name: 'Dr. Smith', role: 'Lead Dentist', status: 'active', currentPatient: 'Sarah Jenkins' },
  { id: 'tm_2', name: 'Dr. Patel', role: 'Orthodontist', status: 'active', currentPatient: 'Available' },
  { id: 'tm_3', name: 'Hygienist Lee', role: 'Hygienist', status: 'break', currentPatient: null },
  { id: 'tm_4', name: 'Jessica (Front Desk)', role: 'Reception', status: 'active', currentPatient: null }
];

export const managerLeadsQueue = [
  { id: 'l_1', name: 'John Davis', interest: 'Dental Implants', status: 'Pending Call', timeInQueue: '15 mins', aiScore: 'High' },
  { id: 'l_2', name: 'Maria Garcia', interest: 'Teeth Whitening', status: 'Pending SMS', timeInQueue: '45 mins', aiScore: 'Medium' },
  { id: 'l_3', name: 'Robert Wilson', interest: 'General Checkup', status: 'AI Engaged', timeInQueue: '2 mins', aiScore: 'Low' }
];

export const managerOverdueTasks = [
  { id: 'tsk_1', task: 'Follow up with missing insurance info', patient: 'Tom Hardy', overdueBy: '2 hours', priority: 'High' },
  { id: 'tsk_2', task: 'Approve supply order', patient: null, overdueBy: '1 day', priority: 'Medium' }
];

export const managerAiAlerts = [
  { id: 'ai_1', alert: 'Patient requested human override', patient: 'Emily Chen', agent: 'Voice Bot 1', time: 'Just now' },
  { id: 'ai_2', alert: 'Unable to parse complex insurance policy', patient: 'James Carter', agent: 'Chat Bot', time: '10 mins ago' }
];

export const managerAiPerformance = {
  callsHandled: 42,
  avgHandleTime: '2m 15s',
  humanEscalationRate: '4.5%',
  appointmentsSecured: 12
};

export const managerFinancials = {
  dailyTarget: 10000,
  currentCollected: 8450,
  projected: 11200,
  insurancePending: 2300,
  patientPending: 850
};
