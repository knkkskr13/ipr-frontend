import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';
import { getAllEmployees } from '../api/employeeApi';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('EMPLOYEE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load employee list so user can pick their record
  // NOTE: /api/v1/employee/get is public or the register page calls it without auth
  useEffect(() => {
    if (role === 'EMPLOYEE') {
      setLoadingEmployees(true);
      getAllEmployees()
        .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
        .catch(() => setEmployees([]))
        .finally(() => setLoadingEmployees(false));
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Username is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (role === 'EMPLOYEE' && !employeeId) { setError('Please select your employee record.'); return; }

    setLoading(true);
    try {
      // Matches AuthController.register() which expects: username, password, role, employeeId
      const payload = {
        username: username.trim(),
        password,
        role,
        ...(role === 'EMPLOYEE' && { employeeId: String(employeeId) }),
      };
      await register(payload);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Registration failed.';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-primary-700 font-bold">GOT</span>
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-xl">Government of Tripura</p>
            <p className="text-blue-200 text-sm">National Informatics Centre &mdash; Tripura State Unit</p>
          </div>
        </div>
        <p className="text-blue-200 text-sm">IPR Management System &mdash; New User Registration</p>
      </div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8">
        <h3 className="text-gray-800 text-lg font-semibold mb-6 text-center">Create New Account</h3>
        {error && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="form-label">Register As <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {['EMPLOYEE', 'ADMIN'].map((r) => (
                <label key={r} className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-lg py-3 cursor-pointer transition-colors ${
                  role === r ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                  <input type="radio" name="role" value={r} checked={role === r}
                    onChange={() => { setRole(r); setEmployeeId(''); }} className="hidden" />
                  <span className="font-medium text-sm">{r === 'ADMIN' ? '🔐 Admin' : '👤 Employee'}</span>
                </label>
              ))}
            </div>
            {role === 'ADMIN' && (
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                ⚠️ Admin accounts have full access — manage all IPR returns and employees.
              </p>
            )}
          </div>

          {/* Credentials */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Credentials</p>
            <div>
              <label className="form-label">Username <span className="text-red-500">*</span></label>
              <input type="text" className="form-input" placeholder="Choose a username"
                value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="form-input pr-10"
                    placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} className="form-input pr-10"
                    placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={showConfirm ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee record picker - only for EMPLOYEE role */}
          {role === 'EMPLOYEE' && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link Your Employee Record</p>
              <p className="text-xs text-gray-500 mb-3">
                Your employee record must be added by an Admin first. Select your name from the list below.
              </p>
              {loadingEmployees ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  Loading employees...
                </div>
              ) : employees.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded px-3 py-2 text-sm">
                  ⚠️ No employee records found. Ask your Admin to add your employee record first, then come back to register.
                </div>
              ) : (
                <div>
                  <label className="form-label">Select Your Name <span className="text-red-500">*</span></label>
                  <select className="form-input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                    <option value="">-- Select your employee record --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}{emp.department ? ` — ${emp.department}` : ''}{emp.presentPostHeld ? ` (${emp.presentPostHeld})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                Registering...
              </span>
            ) : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign In</Link>
        </p>
      </div>
      <p className="mt-6 text-blue-300 text-xs text-center">&copy; {new Date().getFullYear()} Government of Tripura. All rights reserved.</p>
    </div>
  );
}
