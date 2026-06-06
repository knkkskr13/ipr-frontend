import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getAllIprReturns } from '../api/iprApi';
import { formatDate, formatINR } from '../utils/formatters';

export default function MySubmissions() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllIprReturns()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        // Show only submitted/approved/returned
        setReturns(
          data
            .filter((r) => r.status !== 'DRAFT')
            .sort((a, b) => (b.iprId || 0) - (a.iprId || 0))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = returns.filter(
    (r) =>
      !search ||
      String(r.reportingYear).includes(search) ||
      (r.status || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="My Submissions">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">My Submissions</h2>
        <input
          type="text"
          placeholder="Search by year or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input w-64"
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No submitted returns found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Reporting Year</th>
                  <th className="table-header">As On Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Total Annual Income</th>
                  <th className="table-header">Submitted At</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ipr) => (
                  <tr key={ipr.iprId} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{ipr.reportingYear || '—'}</td>
                    <td className="table-cell">{formatDate(ipr.asOnDate)}</td>
                    <td className="table-cell"><StatusBadge status={ipr.status} /></td>
                    <td className="table-cell">₹ {formatINR(ipr.totalAnnualIncome)}</td>
                    <td className="table-cell">{ipr.submittedAt ? formatDate(ipr.submittedAt) : '—'}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => navigate(`/ipr/${ipr.iprId}`)}
                        className="text-xs bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 px-2.5 py-1 rounded font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
