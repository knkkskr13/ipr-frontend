import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getAllIprReturns } from '../api/iprApi';
import { formatDate, formatINR } from '../utils/formatters';

export default function PreviousReturns() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllIprReturns()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setReturns(
          data
            .filter((r) => r.status === 'APPROVED')
            .sort((a, b) => (b.iprId || 0) - (a.iprId || 0))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Previous Returns">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Previous Approved Returns</h2>
        <p className="text-sm text-gray-500 mt-1">All your approved IPR returns are listed here.</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No approved returns found.</div>
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
                {returns.map((ipr) => (
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
