import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';

const ROLES = ['EMPLOYEE', 'ADMIN'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    // Employee profile fields
    name: '',
    service: '',
    department: '',
    presentPost: '',
    placeOfPosting: '',
    lengthOfService: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim()) { setError('Username is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.role === 'EMPLOYEE' && !form.name.trim()) { setError('Full name is required for employee registration.'); return; }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        // Employee profile data — backend should handle this
        employeeDetails: {
          name: form.name.trim(),
          service: form.service.trim(),
          department: form.department.trim(),
          presentPost: form.presentPost.trim(),
          placeOfPosting: form.placeOfPosting.trim(),
          lengthOfService: form.lengthOfService.trim(),
        },
      };
      await register(payload);
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Registration failed. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex flex-col items-center justify-center px-4 py-8">
      {/* Government Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-primary-700 font-bold">GOT</span>
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-xl">Government of Tripura</p>
            <p className="text-blue-200 text-sm">National Informatics Centre — Tripura State Unit</p>
          </div>
        </div>
        <p className="text-blue-200 text-sm">IPR Management System — New User Registration</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8">
        <h3 className="text-gray-800 text-lg font-semibold mb-6 text-center">Create New Account</h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="form-label">Register As <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {ROLES.map((r) => (
                <label key={r} className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-lg py-3 cursor-pointer transition-colors ${
                  form.role === r
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={handle}
                    className="hidden"
                  />
                  <span className="font-medium text-sm">
                    {r === 'ADMIN' ? '🔐 Admin' : '👤 Employee'}
                  </span>
                </label>
              ))}
            </div>
            {form.role === 'ADMIN' && (
              <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                ⚠️ Admin accounts have full access to all IPR returns and employee management.
              </p>
            )}
          </div>

          {/* Account credentials */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account Credentials</p>
            <div className="space-y-3">
              <div>
                <label className="form-label">Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handle}
                  className="form-input"
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handle}
                      className="form-input pr-10"
                      placeholder="Min. 6 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPassword
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handle}
                      className="form-input pr-10"
                      placeholder="Re-enter password"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showConfirm
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee profile fields — only for EMPLOYEE role */}
          {form.role === 'EMPLOYEE' && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Employee Profile Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handle} className="form-input" placeholder="As per service records" />
                </div>
                <div>
                  <label className="form-label">Service</label>
                  <input type="text" name="service" value={form.service} onChange={handle} className="form-input" placeholder="e.g. IAS, TCS" />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <input type="text" name="department" value={form.department} onChange={handle} className="form-input" placeholder="e.g. Finance" />
                </div>
                <div>
                  <label className="form-label">Present Post Held</label>
                  <input type="text" name="presentPost" value={form.presentPost} onChange={handle} className="form-input" placeholder="e.g. Assistant Director" />
                </div>
                <div>
                  <label className="form-label">Place of Posting</label>
                  <input type="text" name="placeOfPosting" value={form.placeOfPosting} onChange={handle} className="form-input" placeholder="e.g. Agartala" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Length of Service</label>
                  <input type="text" name="lengthOfService" value={form.lengthOfService} onChange={handle} className="form-input" placeholder="e.g. 5 years 3 months" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
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

      <p className="mt-6 text-blue-300 text-xs text-center">
        &copy; {new Date().getFullYear()} Government of Tripura. All rights reserved.
      </p>
    </div>
  );
}
