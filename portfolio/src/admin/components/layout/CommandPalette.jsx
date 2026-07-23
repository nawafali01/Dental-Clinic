import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { COMMAND_NAVIGATION_ITEMS, COMMAND_QUICK_ACTIONS } from '../../constants/adminConstants';
import { Search, X, ArrowRight } from 'lucide-react';

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, addRecentItem } = useAdmin();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const allItems = [...COMMAND_NAVIGATION_ITEMS, ...COMMAND_QUICK_ACTIONS];
  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    setIsCommandPaletteOpen(false);
    setQuery('');
    if (item.path) {
      addRecentItem({
        title: item.title,
        path: item.path,
        type: item.category.toLowerCase(),
      });
      navigate(item.path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or quick action..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              ↑↓
            </span>
            <span>Navigate</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              ↵
            </span>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              ESC
            </span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
