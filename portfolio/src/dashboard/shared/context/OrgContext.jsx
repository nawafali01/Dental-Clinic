import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { organizationsService } from '@/services/organizationsService';
import { useRole } from './RoleContext';

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
  const { userRole } = useRole();
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [organizations, setOrganizations] = useState(() => organizationsService.getOrganizationsSync());
  const [isLoading, setIsLoading] = useState(false);

  const refreshOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await organizationsService.getOrganizations();
      if (res?.data) {
        setOrganizations(res.data);
      }
    } catch (err) {
      console.error('[OrgContext] Error fetching organizations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrganizations();
  }, [refreshOrganizations]);

  // If user switches role to org_admin, restrict scope automatically to their org
  useEffect(() => {
    if (userRole === 'org_admin' && organizations.length > 0) {
      if (selectedOrgId === 'all' || !organizations.some((o) => o.id === selectedOrgId)) {
        setSelectedOrgId(organizations[0].id);
      }
    }
  }, [userRole, organizations, selectedOrgId]);

  const defaultOrg = { id: 'all', name: 'All Organizations', isGlobal: true, badgeText: 'Enterprise' };
  const currentOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0] || defaultOrg;

  return (
    <OrgContext.Provider
      value={{
        selectedOrgId,
        setSelectedOrgId,
        currentOrg,
        organizations,
        refreshOrganizations,
        isLoading,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    return {
      selectedOrgId: '',
      setSelectedOrgId: () => {},
      currentOrg: null,
      organizations: [],
      refreshOrganizations: () => {},
      isLoading: false,
    };
  }
  return context;
};
