import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { organizationsService, INITIAL_ORGANIZATIONS } from '@/services/organizationsService';
import { storageService } from '@/services/storage.service';
import { safePct, INITIAL_DEMO_LEADS } from './constants';

import { PipelineHeader } from './components/PipelineHeader';
import { PipelineKpiStrip } from './components/PipelineKpiStrip';
import { PipelineTableView } from './components/PipelineTableView';
import { PipelineKanbanView } from './components/PipelineKanbanView';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';

export default function LeadPipelineView() {
  // ── Global Filter State ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [selectedClinicId, setSelectedClinicId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // ── Loading State (300ms simulated async) ────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ── Drawer State ─────────────────────────────────────────────────
  const [selectedLead, setSelectedLead] = useState(null);

  // ── Pagination State ─────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // ── Organizations Retrieval ──────────────────────────────────────
  const organizations = useMemo(() => {
    const orgs = organizationsService.getOrganizationsSync();
    return orgs && orgs.length > 0 ? orgs : INITIAL_ORGANIZATIONS;
  }, []);

  // ── Dynamic Available Clinics ────────────────────────────────────
  const availableClinics = useMemo(() => {
    if (selectedOrgId === 'all') {
      const allClinics = [];
      organizations.forEach((org) => {
        if (Array.isArray(org.clinics)) {
          org.clinics.forEach((c) => {
            allClinics.push({
              ...c,
              orgId: org.id,
              orgName: org.name,
            });
          });
        }
      });
      return allClinics;
    }

    const matchedOrg = organizations.find((o) => o.id === selectedOrgId);
    if (!matchedOrg || !Array.isArray(matchedOrg.clinics)) return [];
    return matchedOrg.clinics.map((c) => ({
      ...c,
      orgId: matchedOrg.id,
      orgName: matchedOrg.name,
    }));
  }, [organizations, selectedOrgId]);

  // Reset clinic if invalid when switching org
  useEffect(() => {
    if (selectedClinicId !== 'all') {
      const exists = availableClinics.some((c) => c.id === selectedClinicId);
      if (!exists) {
        setSelectedClinicId('all');
      }
    }
  }, [selectedOrgId, availableClinics, selectedClinicId]);

  // ── Storage Leads Initialization & State ─────────────────────────
  const [rawLeads, setRawLeads] = useState(() => {
    const saved = storageService.get(storageService.KEYS.LEADS);
    if (saved && Array.isArray(saved) && saved.length > 0 && saved[0].aiScore) {
      return saved;
    }
    storageService.set(storageService.KEYS.LEADS, INITIAL_DEMO_LEADS);
    return INITIAL_DEMO_LEADS;
  });

  // ── Simulated Loading State ──────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedOrgId, selectedClinicId, selectedStatus, selectedSource]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrgId, selectedClinicId, selectedStatus, selectedSource]);

  // ── Filtered Leads Calculation (AND logic) ───────────────────────
  const filteredLeads = useMemo(() => {
    return rawLeads.filter((lead) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (lead.patientName || '').toLowerCase().includes(q);
        const matchesEmail = (lead.email || '').toLowerCase().includes(q);
        const matchesPhone = (lead.phone || '').toLowerCase().includes(q);
        const matchesTreatment = (lead.treatment || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesTreatment) return false;
      }

      // Organization filter
      if (selectedOrgId !== 'all' && lead.orgId !== selectedOrgId) {
        return false;
      }

      // Clinic filter
      if (selectedClinicId !== 'all' && lead.clinicId !== selectedClinicId) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && lead.status !== selectedStatus) {
        return false;
      }

      // Source filter
      if (selectedSource !== 'all' && lead.source !== selectedSource) {
        return false;
      }

      return true;
    });
  }, [rawLeads, searchQuery, selectedOrgId, selectedClinicId, selectedStatus, selectedSource]);

  // ── KPI Metrics Calculations ─────────────────────────────────────
  const totalCount = filteredLeads.length;
  const unassignedCount = filteredLeads.filter((l) => !l.assignedAgentId).length;
  const hotCount = filteredLeads.filter((l) => l.priority === 'high' || (l.aiScore && l.aiScore >= 80)).length;
  const convertedCount = filteredLeads.filter((l) => l.status === 'converted').length;
  const conversionRateStr = safePct(convertedCount, totalCount);
  const conversionRateNumber = totalCount > 0 ? (convertedCount / totalCount) * 100 : 0;

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // ── Update / Reassign Lead Handler ───────────────────────────────
  const handleUpdateLead = useCallback((leadId, updates) => {
    setRawLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l));
      storageService.set(storageService.KEYS.LEADS, updated);
      return updated;
    });

    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, ...updates } : prev));
    toast.success('Lead updated successfully.');
  }, []);

  // ── CSV Export Handler ───────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    try {
      const dateString = new Date().toISOString().split('T')[0];
      let csvContent = `SUPER ADMIN PIPELINE EXPORT (${dateString})\n`;
      csvContent += `Lead ID,Patient Name,Phone,Email,Clinic,Organization,Treatment,Source,Status,AI Score,Assigned Agent,Created Date\n`;

      filteredLeads.forEach((l) => {
        csvContent += `"${l.id}","${l.patientName}","${l.phone || ''}","${l.email || ''}","${l.clinicName || ''}","${l.orgName || ''}","${l.treatment || ''}","${l.source || ''}","${l.status}","${l.aiScore || 0}","${l.assignedAgentName || 'Unassigned'}","${l.createdAt || ''}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `super-admin-lead-pipeline-${dateString}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export generated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export leads.');
    }
  }, [filteredLeads]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Multi-Tenant Global Controls */}
      <PipelineHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedOrgId={selectedOrgId}
        onSelectOrgId={setSelectedOrgId}
        selectedClinicId={selectedClinicId}
        onSelectClinicId={setSelectedClinicId}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        selectedSource={selectedSource}
        onSelectSource={setSelectedSource}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        organizations={organizations}
        availableClinics={availableClinics}
        onExport={handleExportCSV}
      />

      {/* 2. Pipeline Live KPI Strip */}
      <PipelineKpiStrip
        isLoading={isLoading}
        totalCount={totalCount}
        unassignedCount={unassignedCount}
        hotCount={hotCount}
        conversionRateStr={conversionRateStr}
        conversionRateNumber={conversionRateNumber}
      />

      {/* 3. Main Content: Table View vs Kanban Board View */}
      {viewMode === 'table' ? (
        <PipelineTableView
          isLoading={isLoading}
          leads={filteredLeads}
          paginatedLeads={paginatedLeads}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          onSelectLead={setSelectedLead}
        />
      ) : (
        <PipelineKanbanView
          leads={filteredLeads}
          onSelectLead={setSelectedLead}
        />
      )}

      {/* 4. Lead Detail Slide-over / Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        organizations={organizations}
        availableClinics={availableClinics}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
}
