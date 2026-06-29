import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { employeeApi } from '@/api/employee';
import type { EmployeeResponse } from '@/types/employee';
import type { UserRole } from '@/types/common';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setEmployeesLoading(true);
    employeeApi
      .getAll()
      .then((data) => {
        if (active) setEmployees(data);
      })
      .catch((err) => {
        if (active) setEmployeesError(getErrorMessage(err, 'Could not load employee list.'));
      })
      .finally(() => {
        if (active) setEmployeesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || username.trim().length < 4) {
      setError('Username must be at least 4 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (role === 'EMPLOYEE' && !employeeId) {
      setError('Please select your name from the employee list.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        role,
        employeeId: role === 'EMPLOYEE' ? Number(employeeId) : null,
      });
      showToast('Account created. Please log in.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout tagline="IPRMS - New Registration" cardClassName="max-w-lg">
      <h1 className="text-center text-xl font-bold font-serif underline text-gray-900 mb-6">
        Create New Account
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Register As Toggle */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Register As <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('EMPLOYEE')}
              className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                role === 'EMPLOYEE'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Employee
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
                role === 'ADMIN'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
            </button>
          </div>

          {role === 'EMPLOYEE' ? (
            <div className="mt-3 flex gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs items-center text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              <span className="font-bold">Employee accounts can file and track their own IPR returns</span>
            </div>
          ) : (
            <div className="mt-3 flex gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2.5 text-xs text-yellow-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="font-bold">Admin accounts have full access — manage all IPR returns and employees</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Account Credentials</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            autoComplete="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-400 transition">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="w-full py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none border-0 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-1"
                aria-label="Toggle password visibility"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-400 transition">
              <input
                type={showPwd2 ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className="w-full py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none border-0 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPwd2((p) => !p)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-1"
                aria-label="Toggle password visibility"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Link Employee Record */}
        {role === 'EMPLOYEE' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Link Your Employee Record</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Your employee record must be added by an Admin first. Select your name from the list below.
            </p>

            {employeesLoading ? (
              <div className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50 mb-5">
                Loading employee records…
              </div>
            ) : employeesError ? (
              <div className="flex gap-2 bg-red-50 border border-red-300 rounded-lg px-3 py-2.5 text-xs text-red-700 mb-5">
                {employeesError}
              </div>
            ) : employees.length === 0 ? (
              <div className="flex gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2.5 text-xs text-yellow-800 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>No employee records found. Ask your Admin to add your employee record first, then come back to register.</span>
              </div>
            ) : (
              <div className="mb-5">
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition cursor-pointer bg-white"
                >
                  <option value="" disabled>
                    Select your name...
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.presentPostHeld}, {emp.department}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <Button type="submit" fullWidth isLoading={isLoading} className="mb-4">
          Register
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
