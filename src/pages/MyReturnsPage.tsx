import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { iprReturnApi } from '@/api/iprReturn';
import { notificationApi } from '@/api/notification';
import type { IprReturnResponse } from '@/types/iprReturn';
import { formatCurrency, formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function MyReturnsPage() {
  const [returns, setReturns] = useState<IprReturnResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filingWindowOpen, setFilingWindowOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.all([
      iprReturnApi.getAll(),
      notificationApi
        .getActive()
        .then((n) => {
          const today = new Date().toISOString().slice(0, 10);
          return n.active && today >= n.startDate && today <= n.endDate;
        })
        .catch(() => false),
    ])
      .then(([returnsData, isOpen]) => {
        if (!active) return;
        setReturns(returnsData);
        setFilingWindowOpen(isOpen);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load your IPR returns.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...returns].sort((a, b) => b.reportingYear.localeCompare(a.reportingYear));
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(
      (r) => r.reportingYear.toLowerCase().includes(q) || r.status.toLowerCase().includes(q),
    );
  }, [returns, search]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My IPR Returns</h1>
            <p className="text-sm text-gray-500">Track and manage all your annual property returns.</p>
          </div>
          {filingWindowOpen && (
            <Link to="/my-returns/new">
              <Button icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }>
                File New Annual IPR
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reporting year or status..."
            className="w-full sm:w-72 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          />

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={returns.length === 0 ? 'You have not filed any IPR returns yet.' : 'No returns match your search.'}
              action={
                returns.length === 0 && filingWindowOpen ? (
                  <Link to="/my-returns/new">
                    <Button variant="outline">File your first IPR return</Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Reporting Year</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">As On Date</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Annual Income</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.iprId} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-6 font-semibold text-gray-800">{r.reportingYear}</td>
                      <td className="py-3 pr-6 text-gray-600">{formatDate(r.asOnDate)}</td>
                      <td className="py-3 pr-6 text-gray-600">{formatCurrency(r.totalAnnualIncome)}</td>
                      <td className="py-3 pr-6">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3">
                        <Link to={`/my-returns/${r.iprId}`} className="text-blue-600 font-semibold hover:underline text-sm">
                          {r.status === 'DRAFT' ? 'Continue editing' : 'View'}
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
