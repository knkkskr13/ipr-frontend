import { getStoredUsername, getStoredRole } from '../utils/jwtHelper';

export default function Header({ title }) {
  const username = getStoredUsername();
  const role = getStoredRole();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{title || 'IPR Management System'}</h1>
        <p className="text-xs text-gray-500">National Informatics Centre &mdash; Tripura State Unit</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{username || 'User'}</p>
          <p className="text-xs text-gray-500">{role || ''}</p>
        </div>
        <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">{username?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
      </div>
    </header>
  );
}
