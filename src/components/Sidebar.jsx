import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, clearStoredToken } from '../utils/jwtHelper';

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconFolder = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);
const IconDoc = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconList = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);
const IconHelp = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function Sidebar() {
  const [iprOpen, setIprOpen] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = user?.role || 'EMPLOYEE';

  const handleLogout = () => {
    clearStoredToken();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="w-64 min-h-screen bg-primary-600 flex flex-col flex-shrink-0">
      {/* Logo / Branding */}
      <div className="px-4 py-5 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-bold text-sm">GOT</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Govt. of Tripura</p>
            <p className="text-blue-200 text-xs">IPR Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {role === 'ADMIN' ? (
          <>
            <NavLink to="/admin" end className={linkClass}>
              <IconDashboard /><span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/ipr-returns" className={linkClass}>
              <IconList /><span>All IPR Returns</span>
            </NavLink>
            <NavLink to="/admin/employees" className={linkClass}>
              <IconUsers /><span>Employee List</span>
            </NavLink>
            <NavLink to="/admin/ipr-returns" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <IconList /><span>All IPR Returns</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" end className={linkClass}>
              <IconDashboard /><span>Dashboard</span>
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              <IconUser /><span>My Profile</span>
            </NavLink>

            {/* Collapsible IPR group */}
            <div>
              <button
                onClick={() => setIprOpen((o) => !o)}
                className="sidebar-link w-full justify-between text-blue-100 hover:bg-primary-700 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <IconFolder /><span>IPR / Property</span>
                </span>
                {iprOpen ? <ChevronDown /> : <ChevronRight />}
              </button>
              {iprOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-primary-500 pl-3">
                  <NavLink to="/ipr/new" className={linkClass}>
                    <IconDoc /><span>IPR Filing</span>
                  </NavLink>
                  <NavLink to="/submissions" className={linkClass}>
                    <IconList /><span>My Submissions</span>
                  </NavLink>
                  <NavLink to="/previous-returns" className={linkClass}>
                    <IconList /><span>Previous Returns</span>
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/help" className={linkClass}>
              <IconHelp /><span>Help &amp; Support</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.username || 'User'}</p>
            <p className="text-blue-200 text-xs">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-blue-200 hover:text-white text-sm flex items-center gap-2 py-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
