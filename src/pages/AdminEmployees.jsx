import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAllEmployees, createEmployee, updateEmployee } from '../api/employeeApi';

const EMPTY_FORM = {
  name: '',
  service: '',
  department: '',
  presentPost: '',
  placeOfPosting: '',
  lengthOfService: '',
};

function EmployeeModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Full name is required.'); return; }
    setSaving(true); setErr('');
    try {
      await onSave(form);
      onClose();
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">{initial?.employeeId ? 'Edit Employee' : 'Add New Employee'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {err && <div className="bg-red-50 border border-red-300 text-red-700 rounded px-3 py-2 text-sm">{err}</div>}
          <div>
            <label className="form-label">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handle} className="form-input" placeholder="As per service records" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div>
            <label className="form-label">Length of Service</label>
            <input type="text" name="lengthOfService" value={form.lengthOfService} onChange={handle} className="form-input" placeholder="e.g. 5 years 3 months" />
          </div>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await getAllEmployees();
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSave = async (formData) => {
    if (editing?.employeeId) {
      const res = await updateEmployee(editing.employeeId, formData);
      setEmployees((prev) => prev.map((e) => e.employeeId === editing.employeeId ? res.data : e));
    } else {
      const res = await createEmployee(formData);
      setEmployees((prev) => [...prev, res.data]);
    }
    setEditing(null);
  };

  const filtered = employees.filter(
    (e) =>
      !search ||
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.service || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Employee Management">
      {showModal && (
        <EmployeeModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">View and manage all registered employees</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}

      <div className="card">
        <div className="px-5 py-3 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by name, department, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-72"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No employees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Full Name</th>
                  <th className="table-header">Service</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Present Post</th>
                  <th className="table-header">Place of Posting</th>
                  <th className="table-header">Length of Service</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, idx) => (
                  <tr key={emp.employeeId || idx} className="hover:bg-gray-50">
                    <td className="table-cell text-gray-400">{idx + 1}</td>
                    <td className="table-cell font-medium">{emp.name || '—'}</td>
                    <td className="table-cell">{emp.service || '—'}</td>
                    <td className="table-cell">{emp.department || '—'}</td>
                    <td className="table-cell">{emp.presentPost || emp.presentPostHeld || '—'}</td>
                    <td className="table-cell">{emp.placeOfPosting || '—'}</td>
                    <td className="table-cell">{emp.lengthOfService || '—'}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => { setEditing(emp); setShowModal(true); }}
                        className="text-xs bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 px-2.5 py-1 rounded font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              {filtered.length} employee{filtered.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
