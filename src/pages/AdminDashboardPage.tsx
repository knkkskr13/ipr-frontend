import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { iprReturnApi } from '@/api/iprReturn';
import { employeeApi } from '@/api/employee';
import { notificationApi } from '@/api/notification';
import type { IprReturnResponse } from '@/types/iprReturn';
import type { IprNotificationResponse } from '@/types/notification';
import { formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function AdminDashboardPage() {
  const [returns, setReturns] = useState<IprReturnResponse[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [notification, setNotification] = useState<IprNotificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.all([
      iprReturnApi.getAll(),
      employeeApi.getAll(),
      notificationApi.getActive().catch(() => null),
    ])
      .then(([returnsData, employees, activeNotification]) => {
        if (!active) return;
        setReturns(returnsData);
        setEmployeeCount(employees.length);
        setNotification(activeNotification);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load admin dashboard.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = returns.length;
    const draft = returns.filter((r) => r.status === 'DRAFT').length;
    const submitted = returns.filter((r) => r.status === 'SUBMITTED').length;
    const approved = returns.filter((r) => r.status === 'APPROVED').length;
    const returned = returns.filter((r) => r.status === 'RETURNED').length;
    return { total, draft, submitted, approved, returned };
  }, [returns]);

  const pendingReview = useMemo(
    () =>
      returns
        .filter((r) => r.status === 'SUBMITTED')
        .sort((a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime())
        .slice(0, 6),
    [returns],
  );

  const isFilingWindowOpen = isNotificationWindowOpen(notification);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of IPR filings across all employees.</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {notification && (
          <div
            className={`mb-5 rounded-xl border p-4 flex items-start gap-3 ${
              isFilingWindowOpen ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isFilingWindowOpen ? 'text-green-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="flex-1">
              <p className={`text-sm font-bold ${isFilingWindowOpen ? 'text-green-800' : 'text-yellow-800'}`}>
                {notification.title} {isFilingWindowOpen ? '— Filing window is OPEN' : '— Filing window is CLOSED'}
              </p>
              <p className={`text-sm mt-0.5 ${isFilingWindowOpen ? 'text-green-700' : 'text-yellow-700'}`}>
                {notification.message}
              </p>
            </div>
            <Link to="/admin/notifications" className="text-xs font-semibold text-blue-600 hover:underline flex-shrink-0">
              Manage
            </Link>
          </div>
        )}

        {!notification && !isLoading && (
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">No active filing window has been configured.</p>
            <Link to="/admin/notifications" className="text-xs font-semibold text-blue-600 hover:underline flex-shrink-0">
              Set up filing window
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
          <StatCard label="Total Employees" value={employeeCount} color="blue" isLoading={isLoading} />
          <StatCard label="Total Returns" value={stats.total} color="blue" isLoading={isLoading} />
          <StatCard label="Draft" value={stats.draft} color="gray" isLoading={isLoading} />
          <StatCard label="Awaiting Review" value={stats.submitted} color="yellow" isLoading={isLoading} />
          <StatCard label="Approved" value={stats.approved} color="green" isLoading={isLoading} />
          <StatCard label="Returned" value={stats.returned} color="red" isLoading={isLoading} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Awaiting Your Review
            </h2>
            <Link to="/admin/returns" className="text-xs font-semibold text-blue-600 hover:underline">
              View all returns
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-blue-600" />
            </div>
          ) : pendingReview.length === 0 ? (
            <EmptyState title="No submissions are awaiting review." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Employee</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Year</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Submitted</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReview.map((r) => (
                    <tr key={r.iprId} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-6">
                        <Link to={`/admin/returns/${r.iprId}`} className="text-blue-600 font-semibold hover:underline">
                          {r.employeeName}
                        </Link>
                        <p className="text-xs text-gray-400">{r.employeeDepartment}</p>
                      </td>
                      <td className="py-3 pr-6 text-gray-600">{r.reportingYear}</td>
                      <td className="py-3 pr-6 text-gray-600">{formatDateTime(r.submittedAt)}</td>
                      <td className="py-3">
                        <StatusBadge status={r.status} />
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

function isNotificationWindowOpen(notification: IprNotificationResponse | null): boolean {
  if (!notification || !notification.active) return false;
  const today = new Date().toISOString().slice(0, 10);
  return today >= notification.startDate && today <= notification.endDate;
}

function StatCard({
  label,
  value,
  color,
  isLoading,
}: {
  label: string;
  value: number;
  color: 'blue' | 'gray' | 'yellow' | 'green' | 'red';
  isLoading: boolean;
}) {
  const colorMap = {
    blue: 'text-blue-600',
    gray: 'text-gray-500',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    red: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight mb-3">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{isLoading ? '—' : value}</p>
    </div>
  );
}
