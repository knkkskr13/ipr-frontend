import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getEmployeeById } from '../api/employeeApi';
import { getIprReturnsByEmployee, deleteIprReturn } from '../api/iprApi';
import { formatDate, formatINR } from '../utils/formatters';
import { getStoredEmployeeId } from '../utils/jwtHelper';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [iprReturns, setIprReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const employeeId = getStoredEmployeeId();
    if (!employeeId) {
      setError('No employee record linked to your account. Please contact Admin.');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [empRes, iprRes] = await Promise.all([
          getEmployeeById(employeeId),
          getIprReturnsByEmployee(employeeId),
        ]);
        setEmployee(empRes.data);
        const data = Array.isArray(iprRes.data) ? iprRes.data : [];
        setIprReturns(data.sort((a, b) => (b.iprId || 0) - (a.iprId || 0)));
      } catch {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this DRAFT return?')) return;
    try {
      await deleteIprReturn(id);
      setIprReturns((prev) => prev.filter((r) => r.iprId !== id));
    } catch { alert('Failed to delete.'); }
  };

  if (loading) return (
    <Layout title="Employee Dashboard">
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
      </div>
    </Layout>
  );

  return (
    <Layout title="Employee Dashboard">
      {error && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Welcome, {employee?.name || 'Employee'}</h2>
        <p className="text-sm text-gray-500 mt-1">Immovable Property Return &mdash; Employee Portal</p>
      </div>

      {/* Profile Card - uses exact Employee entity field names */}
      {employee && (
        <div className="card p-5 mb-6">
          <h3 className="section-title">My Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['Name', employee.name],
              ['Service', employee.service],
              ['Department', employee.department],
              ['Present Post Held', employee.presentPostHeld],
              ['Place of Posting', employee.placeOfPosting],
              ['Length of Service', employee.lengthOfService],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm text-gray-800 font-semibold mt-0.5">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">My IPR Returns</h3>
          <button onClick={() => navigate('/ipr/new')} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New IPR Return
          </button>
        </div>
        {iprReturns.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm">No IPR returns yet. Click "New IPR Return" to get started.</p>
          </div>
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
                {iprReturns.map((ipr) => (
                  <tr key={ipr.iprId} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{ipr.reportingYear || '—'}</td>
                    <td className="table-cell">{formatDate(ipr.asOnDate)}</td>
                    <td className="table-cell"><StatusBadge status={ipr.status} /></td>
                    <td className="table-cell">₹ {formatINR(ipr.totalAnnualIncome)}</td>
                    <td className="table-cell">{ipr.submittedAt ? formatDate(ipr.submittedAt) : '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {ipr.status === 'DRAFT' && (
                          <>
                            <button onClick={() => navigate(`/ipr/${ipr.iprId}`)}
                              className="text-xs bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 px-2.5 py-1 rounded font-medium">Edit</button>
                            <button onClick={() => handleDelete(ipr.iprId)}
                              className="text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded font-medium">Delete</button>
                          </>
                        )}
                        {['SUBMITTED', 'APPROVED', 'RETURNED'].includes(ipr.status) && (
                          <button onClick={() => navigate(`/ipr/${ipr.iprId}`)}
                            className="text-xs bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 px-2.5 py-1 rounded font-medium">View</button>
                        )}
                      </div>
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
