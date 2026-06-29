import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { iprReturnApi } from '@/api/iprReturn';
import { notificationApi } from '@/api/notification';
import type { IprReturnResponse } from '@/types/iprReturn';
import type { IprNotificationResponse } from '@/types/notification';
import { formatDate, formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [returns, setReturns] = useState<IprReturnResponse[]>([]);
  const [notification, setNotification] = useState<IprNotificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.all([
      iprReturnApi.getAll(),
      notificationApi.getActive().catch(() => null),
    ])
      .then(([returnsData, activeNotification]) => {
        if (!active) return;
        setReturns(returnsData);
        setNotification(activeNotification);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load your dashboard.'));
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
    const pending = returns.filter((r) => r.status === 'DRAFT').length;
    const submitted = returns.filter((r) => r.status === 'SUBMITTED').length;
    const approved = returns.filter((r) => r.status === 'APPROVED').length;
    const returned = returns.filter((r) => r.status === 'RETURNED').length;
    return { total, pending, submitted, approved, returned };
  }, [returns]);

  const recent = useMemo(
    () =>
      [...returns]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [returns],
  );

  const employee = user?.employee;
  const isFilingWindowOpen = isNotificationWindowOpen(notification);

  const initials = employee?.name
    ? employee.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Welcome header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">{initials}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Welcome back{employee ? `, ${employee.name}` : ''}
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {employee?.presentPostHeld ?? '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {employee?.department ?? '—'} &nbsp;|&nbsp; ID: EMP{employee?.id ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 tracking-wide uppercase">
              {employee?.service ?? 'Tripura State Civil Services'}
            </span>
            <span className="text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 tracking-wide uppercase">
              {employee?.placeOfPosting ?? '—'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Filing window banner */}
        {notification && (
          <div
            className={`mb-5 rounded-xl border p-4 flex items-start gap-3 ${
              isFilingWindowOpen
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isFilingWindowOpen ? 'text-green-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <p className={`text-sm font-bold ${isFilingWindowOpen ? 'text-green-800' : 'text-yellow-800'}`}>
                {notification.title}
              </p>
              <p className={`text-sm mt-0.5 ${isFilingWindowOpen ? 'text-green-700' : 'text-yellow-700'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Filing window: {formatDate(notification.startDate)} – {formatDate(notification.endDate)}
                {!isFilingWindowOpen && ' (currently closed)'}
              </p>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
          <StatCard label="Total IPR Requests" value={stats.total} icon="doc" color="blue" isLoading={isLoading} />
          <StatCard label="Pending Filings" value={stats.pending} icon="clock" color="yellow" isLoading={isLoading} />
          <StatCard label="Submissions" value={stats.submitted} icon="upload" color="blue" isLoading={isLoading} />
          <StatCard label="Approved Returns" value={stats.approved} icon="check" color="green" isLoading={isLoading} />
          <StatCard label="Rejected Returns" value={stats.returned} icon="x" color="red" isLoading={isLoading} />
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Quick Dashboard Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {isFilingWindowOpen ? (
              <Link to="/my-returns/new">
                <Button fullWidth icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }>
                  File New Annual IPR
                </Button>
              </Link>
            ) : (
              <Button fullWidth disabled icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }>
                Filing Window Closed
              </Button>
            )}

            <Link to="/my-returns">
              <Button variant="outline" fullWidth icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }>
                View My Submissions
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Recent Activity History
            </h2>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner className="text-blue-600" />
                </div>
              ) : recent.length === 0 ? (
                <EmptyState title="No filings registered in your account." />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide pr-6">Reporting Year</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide pr-6">Last Updated</th>
                      <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.iprId} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-6">
                          <Link to={`/my-returns/${r.iprId}`} className="text-blue-600 font-semibold hover:underline">
                            {r.reportingYear}
                          </Link>
                        </td>
                        <td className="py-3 pr-6 text-gray-600">{formatDateTime(r.updatedAt)}</td>
                        <td className="py-3">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notifications & Alerts</h2>
            </div>

            {notification ? (
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-800 mb-1">{notification.title}</p>
                <p className="leading-relaxed">{notification.message}</p>
              </div>
            ) : (
              <EmptyState title="No new notifications." />
            )}
          </div>
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

interface StatCardProps {
  label: string;
  value: number;
  icon: 'doc' | 'clock' | 'upload' | 'check' | 'x';
  color: 'blue' | 'yellow' | 'green' | 'red';
  isLoading: boolean;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-yellow-50 text-yellow-500',
  green: 'bg-green-50 text-green-500',
  red: 'bg-red-50 text-red-500',
};

const iconPaths: Record<StatCardProps['icon'], string> = {
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  upload: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  x: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

function StatCard({ label, value, icon, color, isLoading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
          </svg>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{isLoading ? '—' : value}</p>
    </div>
  );
}
