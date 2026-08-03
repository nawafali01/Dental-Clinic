import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTE_NAME_MAP } from '@/dashboard/shared/constants/adminConstants';
import { useRole } from '@/dashboard/shared/context/RoleContext';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { currentRole } = useRole();
  const rootRoleName = currentRole?.label || 'Dashboard';

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1 hover:text-slate-900:text-slate-100 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{rootRoleName}</span>
      </Link>

      {pathnames.map((value, index) => {
        if (value === 'admin') return null;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = ROUTE_NAME_MAP[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-900">{displayName}</span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-900:text-slate-100 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
