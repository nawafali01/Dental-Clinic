import React from 'react';

export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue:    "bg-blue-100 text-blue-700",
    green:   "bg-emerald-100 text-emerald-700",
    amber:   "bg-amber-100 text-amber-700",
    red:     "bg-red-100 text-red-700",
    purple:  "bg-purple-100 text-purple-700",
    slate:   "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.blue}`}>{children}</span>;
};

export const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-emerald-600 font-medium mt-1">{sub}</p>}
  </div>
);

export const DevBanner = ({ text }) => (
  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
    🚧 {text} — will connect to the backend API when available.
  </div>
);

export const PageHeader = ({ title, description, action }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
    {action && (
      <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
        {action}
      </button>
    )}
  </div>
);

export const Table = ({ headers, rows }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          {headers.map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-slate-700">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
