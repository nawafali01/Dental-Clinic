import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ title, subtitle, action, children, className = '', headerClassName = '' }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow',
          className
        )
      )}
    >
      {(title || action) && (
        <div
          className={twMerge(
            clsx('flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80', headerClassName)
          )}
        >
          <div>
            {title && (
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
