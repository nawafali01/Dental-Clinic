import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';

export const MultiClinicPerformanceTable = ({
  isLoading,
  multiClinicData,
  paginatedClinics,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  return (
    <Card
      title="Multi-Clinic Performance Benchmarks"
      subtitle="Operational efficiency, booking velocity, and recognized yield by clinic branch"
      action={
        <span className="text-xs font-semibold text-slate-500">
          Showing {paginatedClinics.length} of {multiClinicData.length} Clinics
        </span>
      }
    >
      {isLoading ? (
        <div className="space-y-2 py-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : multiClinicData.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No clinics found matching the selected organization and clinic criteria.
          <div className="mt-1 text-slate-400">Try adjusting the organization, clinic, or date range.</div>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Clinic Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Organization</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Leads</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Bookings</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Conv Rate %</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Revenue Generated</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                        <span className="truncate">{clinic.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 pl-4">{clinic.city}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                        {clinic.orgName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 font-semibold">{clinic.leads}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 font-semibold">{clinic.bookings}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge
                        variant={
                          clinic.convRateNumber >= 40
                            ? 'success'
                            : clinic.convRateNumber >= 25
                            ? 'info'
                            : 'warning'
                        }
                        className="font-mono text-[11px] font-bold"
                      >
                        {clinic.convRateStr}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {clinic.formattedRevenue}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          clinic.status === 'active'
                            ? 'success'
                            : clinic.status === 'warning'
                            ? 'warning'
                            : 'error'
                        }
                        dot
                      >
                        {clinic.status === 'active'
                          ? 'Active'
                          : clinic.status === 'warning'
                          ? 'Warning'
                          : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Local Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
