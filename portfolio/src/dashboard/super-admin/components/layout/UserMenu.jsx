import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { User, Settings, ShieldAlert, LogOut, ChevronDown, Sparkles } from 'lucide-react';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { currentRole } = useRole();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const name = currentUser?.fullName || 'User';
  const email = currentUser?.email || '';
  const roleLabel = currentRole?.label || 'Dashboard User';
  const initials = getInitials(name);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100:bg-slate-800/70 transition-colors"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center font-semibold text-xs shadow-md shadow-primary/20">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="text-left hidden md:block">
          <div className="text-xs font-semibold text-slate-900 leading-tight">
            {name}
          </div>
          <div className="text-[10px] text-slate-400">{roleLabel}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-900">
              {name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {email}
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-semibold border border-purple-500/20">
              <Sparkles className="w-3 h-3" />
              {roleLabel}
            </div>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/admin/profile');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100:bg-slate-800 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>My Profile</span>
          </button>

          {currentRole?.id === 'super_admin' && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/settings');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Platform Settings</span>
            </button>
          )}

          <div className="border-t border-slate-100 my-1" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
