import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../api/notificationApi';

// ─── helpers ────────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  title: '',
  message: '',
  startDate: todayISO(),
  endDate: '',
  active: true,
};

// ─── Notification Form Modal ─────────────────────────────────────────────────
function NotificationModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title || '',
          message: initial.message || '',
          startDate: initial.startDate?.split('T')[0] || todayISO(),
          endDate: initial.endDate?.split('T')[0] || '',
          active: initial.active ?? true,
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    if (!form.startDate)    { setErr('Start date is required.'); return; }
    if (!form.endDate)      { setErr('End date is required.'); return; }
    if (form.endDate < form.startDate) { setErr('End date cannot be before start date.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave(form);
      onClose();
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">
            {isEdit ? 'Edit Filing Window' : 'Create Filing Window'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {err && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded px-3 py-2 text-sm">{err}</div>
          )}

          <div>
            <label className="form-label">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handle}
              className="form-input"
              placeholder="e.g. IPR Filing 2025-26"
            />
          </div>

          <div>
            <label className="form-label">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handle}
              rows={3}
              className="form-input resize-none"
              placeholder="Instructions or details for employees..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handle}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handle}
                className="form-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={form.active}
              onChange={handle}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <label htmlFor="active" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">Active</span>
              <span className="text-gray-500 ml-1">— employees can file when this is checked</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminNotifications ─────────────────────────────────────────────────
export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit

  // ── Load all notifications ─────────────────────────────────────────────────
  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllNotifications();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    await createNotification(formData);
    showSuccess('Filing window created successfully.');
    loadNotifications();
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleUpdate = async (formData) => {
    await updateNotification(editing.id, formData);
    showSuccess('Filing window updated successfully.');
    loadNotifications();
  };

  // ── Quick toggle active/inactive ──────────────────────────────────────────
  const handleToggle = async (notif) => {
    try {
      await updateNotification(notif.id, { ...notif, active: !notif.active });
      showSuccess(`Filing window ${!notif.active ? 'activated' : 'deactivated'}.`);
      loadNotifications();
    } catch {
      setError('Failed to update status.');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this filing window? This cannot be undone.')) return;
    try {
      await deleteNotification(id);
      showSuccess('Filing window deleted.');
      loadNotifications();
    } catch {
      setError('Failed to delete.');
    }
  };

  // ── Format date for display ────────────────────────────────────────────────
  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout title="Filing Window Management">
      {/* Modal */}
      {showModal && (
        <NotificationModal
          initial={editing}
          onSave={editing ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">IPR Filing Window</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create and manage filing windows — only one should be active at a time
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Window
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-300 text-green-700 rounded-md px-4 py-3 text-sm">{successMsg}</div>
      )}

      {/* Info box */}
      <div className="mb-5 bg-blue-50 border border-blue-200 rounded-md px-4 py-3 flex gap-3">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700">
          When a filing window is <strong>Active</strong>, employees can create, save, and submit their IPR returns.
          When no window is active, all filing actions are blocked automatically.
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <svg className="animate-spin w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="font-medium text-gray-500">No filing windows created yet</p>
            <p className="text-sm mt-1">Click "New Window" to create the first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header">Message</th>
                  <th className="table-header">Start Date</th>
                  <th className="table-header">End Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium text-gray-800">{n.title}</td>
                    <td className="table-cell text-gray-500 max-w-xs">
                      <span className="line-clamp-2">{n.message || '—'}</span>
                    </td>
                    <td className="table-cell">{fmt(n.startDate)}</td>
                    <td className="table-cell">{fmt(n.endDate)}</td>
                    <td className="table-cell">
                      {/* Toggle button — click to flip active/inactive */}
                      <button
                        onClick={() => handleToggle(n)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          n.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={n.active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${n.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {n.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => { setEditing(n); setShowModal(true); }}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
