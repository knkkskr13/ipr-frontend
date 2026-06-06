import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getAllIprReturns, approveIprReturn } from '../api/iprApi';
import { formatDate, formatINR } from '../utils/formatters';

const FILTERS = ['All', 'DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED'];

const KpiCard = ({ label, value, color }) => (
  <div className={`card p-5 border-l-4 ${color}`}>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState('');

  const fetchReturns = async () => {
    try {
      const res = await getAllIprReturns();
      const data = Array.isArray(res.data) ? res.data : [];
      setReturns(data.sort((a, b) => (b.iprId || 0) - (a.iprId || 0)));
    } catch {
      setError('Failed to load IPR returns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReturns(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this IPR return?')) return;
    setApprovingId(id);
    try {
      await approveIprReturn(id);
      setReturns((prev) =>
        prev.map((r) => r.iprId === id ? { ...r, status: 'APPROVED' } : r)
      );
    } catch {
      alert('Failed to approve. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const counts = {
    total: returns.length,
    submitted: returns.filter((r) => r.status === 'SUBMITTED').length,
    approved: returns.filter((r) => r.status === 'APPROVED').length,
    returned: returns.filter((r) => r.status === 'RETURNED').length,
  };

  const filtered = returns.filter((r) => {
    const matchFilter = filter === 'All' || r.status === filter;
    const matchSearch =
      !search ||
      (r.employee?.name || r.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.employee?.department || r.department || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.reportingYear).includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <Layout title="Admin Dashboard">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Manage and review all employee IPR returns</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total IPRs" value={counts.total} color="border-primary-600" />
        <KpiCard label="Pending Approval" value={counts.submitted} color="border-yellow-500" />
        <KpiCard label="Approved" value={counts.approved} color="border-green-500" />
        <KpiCard label="Returned" value={counts.returned} color="border-red-500" />
      </div>

      {/* Filters + Search */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by employee, department, year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Employee Name</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Reporting Year</th>
                  <th className="table-header">As On Date</th>
                  <th className="table-header">Total Income</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Submitted At</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ipr, idx) => {
                  const empName = ipr.employee?.name || ipr.employeeName || '—';
                  const dept = ipr.employee?.department || ipr.department || '—';
                  return (
                    <tr key={ipr.iprId} className="hover:bg-gray-50">
                      <td className="table-cell text-gray-400">{idx + 1}</td>
                      <td className="table-cell font-medium">{empName}</td>
                      <td className="table-cell">{dept}</td>
                      <td className="table-cell">{ipr.reportingYear || '—'}</td>
                      <td className="table-cell">{formatDate(ipr.asOnDate)}</td>
                      <td className="table-cell">₹ {formatINR(ipr.totalAnnualIncome)}</td>
                      <td className="table-cell"><StatusBadge status={ipr.status} /></td>
                      <td className="table-cell">{ipr.submittedAt ? formatDate(ipr.submittedAt) : '—'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/ipr/${ipr.iprId}`)}
                            className="text-xs bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 px-2.5 py-1 rounded font-medium"
                          >
                            View
                          </button>
                          {ipr.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleApprove(ipr.iprId)}
                              disabled={approvingId === ipr.iprId}
                              className="text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-2.5 py-1 rounded font-medium disabled:opacity-50"
                            >
                              {approvingId === ipr.iprId ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              Showing {filtered.length} of {returns.length} records
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
