import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../api/authApi';
import { getMe } from '../api/userApi';
import { setStoredToken, decodeToken, clearStoredToken } from '../utils/jwtHelper';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.message || '';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Please enter both username and password.'); return; }
    setLoading(true);
    try {
      // Step 1: Login -> get JWT token
      const res = await login(username.trim(), password);
      const token = res.data.token;
      setStoredToken(token);

      // Step 2: Decode token to get username (sub field)
      const payload = decodeToken(token);
      localStorage.setItem('username', payload?.sub || username.trim());

      // Step 3: Fetch user details from backend to get role + employeeId
      // Your backend needs a /api/v1/user/get/me endpoint that returns { id, username, role, employee: { id, name, ... } }
      try {
        const userRes = await getMe();
        const userData = userRes.data;
        const role = (userData.role || 'EMPLOYEE').toUpperCase();
        localStorage.setItem('role', role);
        if (userData.employee?.id) {
          localStorage.setItem('employeeId', String(userData.employee.id));
        }
        navigate(role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
      } catch {
        // Fallback if /user/me not yet implemented: default to EMPLOYEE
        localStorage.setItem('role', 'EMPLOYEE');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      clearStoredToken();
      const msg = err?.response?.data?.message || err?.response?.data || 'Invalid username or password.';
      setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-primary-700 font-bold text-lg">GOT</span>
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-xl">Government of Tripura</p>
            <p className="text-blue-200 text-sm">National Informatics Centre &mdash; Tripura State Unit</p>
          </div>
        </div>
        <div className="border-t border-blue-400 pt-4">
          <h2 className="text-white text-2xl font-bold tracking-wide">Employee Portal</h2>
          <p className="text-blue-200 text-sm mt-1">Immovable Property Return (IPR) Management System</p>
          <p className="text-blue-300 text-xs mt-1">Batch 13 &mdash; Summer Training</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <h3 className="text-gray-800 text-lg font-semibold mb-6 text-center">Sign In to Your Account</h3>
        {successMsg && <div className="mb-4 bg-green-50 border border-green-300 text-green-700 rounded-md px-4 py-3 text-sm">{successMsg}</div>}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Username</label>
            <input type="text" className="form-input" placeholder="Enter your username"
              value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className="form-input pr-10"
                placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={showPassword
                      ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New user?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">Register here</Link>
        </p>
      </div>
      <p className="mt-6 text-blue-300 text-xs text-center">&copy; {new Date().getFullYear()} Government of Tripura. All rights reserved.</p>
    </div>
  );
}
