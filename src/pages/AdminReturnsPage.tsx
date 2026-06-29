import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { iprReturnApi } from '@/api/iprReturn';
import type { IprReturnResponse } from '@/types/iprReturn';
import type { IprStatus } from '@/types/common';
import { formatCurrency, formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

const STATUS_FILTERS: { label: string; value: IprStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Returned', value: 'RETURNED' },
];

export function AdminReturnsPage() {
  const [returns, setReturns] = useState<IprReturnResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IprStatus | 'ALL'>('ALL');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    iprReturnApi
      .getAll()
      .then((data) => {
        if (active) setReturns(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load IPR returns.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = returns;
    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeDepartment.toLowerCase().includes(q) ||
          r.reportingYear.toLowerCase().includes(q),
      );
    }
    return [...result].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [returns, search, statusFilter]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">IPR Returns</h1>
          <p className="text-sm text-gray-500">Review and approve employee IPR filings.</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee, department, or year..."
              className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg border transition ${
                    statusFilter === f.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No IPR returns match your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Employee</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Department</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Year</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">As On Date</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Annual Income</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.iprId} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-6 font-semibold text-gray-800">{r.employeeName}</td>
                      <td className="py-3 pr-6 text-gray-600">{r.employeeDepartment}</td>
                      <td className="py-3 pr-6 text-gray-600">{r.reportingYear}</td>
                      <td className="py-3 pr-6 text-gray-600">{formatDate(r.asOnDate)}</td>
                      <td className="py-3 pr-6 text-gray-600">{formatCurrency(r.totalAnnualIncome)}</td>
                      <td className="py-3 pr-6">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3">
                        <Link to={`/admin/returns/${r.iprId}`} className="text-blue-600 font-semibold hover:underline text-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
