import React, { createContext, useContext, useState, useEffect } from 'react';
import { ORGANIZATIONS } from '../mockData/organizationsData';
import { useRole } from './RoleContext';

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
  const { userRole } = useRole();
  const [selectedOrgId, setSelectedOrgId] = useState('all'); // 'all' | 'apex' | 'smilecare'

  // If user switches role to org_admin, restrict scope automatically to Apex Dental Group
  useEffect(() => {
    if (userRole === 'org_admin' && selectedOrgId === 'all') {
      setSelectedOrgId('apex');
    }
  }, [userRole, selectedOrgId]);

  const currentOrg = ORGANIZATIONS.find((o) => o.id === selectedOrgId) || ORGANIZATIONS[0];

  return (
    <OrgContext.Provider
      value={{
        selectedOrgId,
        setSelectedOrgId,
        currentOrg,
        organizations: ORGANIZATIONS,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};
