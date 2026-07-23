import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Clock, ChevronDown, ExternalLink } from 'lucide-react';

export const RecentItems = () => {
  const { recentItems } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Recent</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Recently Visited
          </div>
          {recentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setIsOpen(false);
                navigate(item.path);
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">{item.time}</div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
