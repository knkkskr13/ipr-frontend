import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
      showToast('Logged in successfully.', 'success');
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid credentials. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout tagline="IPRMS - Universal Login">
      <h1 className="text-center text-2xl underline font-serif font-bold text-black mb-2">
        Welcome Back
      </h1>
      <p className="text-center font-mono underline text-sm text-black mb-6">
        Log in to your IPR Management account
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none border-0 bg-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none border-0 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} className="text-xl py-3 mb-4">
          Log In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
