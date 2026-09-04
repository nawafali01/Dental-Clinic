import React from 'react';

export const SettingsSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb & Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-slate-200 rounded-xl" />
          <div className="h-10 w-36 bg-slate-300 rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-36 bg-slate-200 rounded-xl" />
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-4 w-72 bg-slate-100 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-6 w-40 bg-slate-200 rounded-md" />
            <div className="h-28 bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded-md" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
