import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getEmployeeById } from '../api/employeeApi';
import { getStoredEmployeeId, getStoredUsername } from '../utils/jwtHelper';

export default function MyProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = getStoredUsername();

  useEffect(() => {
    const employeeId = getStoredEmployeeId();
    if (!employeeId) {
      setError('No employee record linked to your account.');
      setLoading(false);
      return;
    }
    getEmployeeById(employeeId)
      .then((res) => setEmployee(res.data))
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="My Profile">
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    </Layout>
  );

  return (
    <Layout title="My Profile">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Your employee details as per service records</p>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}

      {/* Account Info */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">Account Information</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{employee?.name || username}</p>
            <p className="text-sm text-gray-500">@{username}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 mt-1">EMPLOYEE</span>
          </div>
        </div>
      </div>

      {/* Employee Details */}
      {employee && (
        <div className="card p-5">
          <h3 className="section-title">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ['Full Name', employee.name],
              ['Email', employee.email],
              ['Service', employee.service],
              ['Department', employee.department],
              ['Present Post Held', employee.presentPostHeld],
              ['Place of Posting', employee.placeOfPosting],
              ['Length of Service', employee.lengthOfService],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-800 font-semibold mt-1">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
