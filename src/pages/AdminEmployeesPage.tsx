import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { TextField } from '@/components/FormFields';
import { useToast } from '@/context/ToastContext';
import { employeeApi } from '@/api/employee';
import type { EmployeeRequest, EmployeeResponse } from '@/types/employee';
import { getErrorMessage } from '@/utils/getErrorMessage';

type FormState = EmployeeRequest;

const emptyForm: FormState = {
  name: '',
  email: '',
  service: '',
  department: '',
  lengthOfService: '',
  presentPostHeld: '',
  placeOfPosting: '',
};

export function AdminEmployeesPage() {
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EmployeeResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  function loadEmployees() {
    setIsLoading(true);
    setError(null);
    employeeApi
      .getAll()
      .then(setEmployees)
      .catch((err) => setError(getErrorMessage(err, 'Could not load employee records.')))
      .finally(() => setIsLoading(false));
  }

  const filtered = useMemo(() => {
    const sorted = [...employees].sort((a, b) => a.name.localeCompare(b.name));
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.presentPostHeld.toLowerCase().includes(q),
    );
  }, [employees, search]);

  function openAddModal() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setSubmitError(null);
    setModalOpen(true);
  }

  function openEditModal(emp: EmployeeResponse) {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      service: emp.service,
      department: emp.department,
      lengthOfService: emp.lengthOfService,
      presentPostHeld: emp.presentPostHeld,
      placeOfPosting: emp.placeOfPosting,
    });
    setFormErrors({});
    setSubmitError(null);
    setModalOpen(true);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please provide a valid email address.';
    }
    if (!form.service.trim()) next.service = 'Service category is required.';
    if (!form.department.trim()) next.department = 'Department is required.';
    if (!form.lengthOfService.trim()) next.lengthOfService = 'Length of service is required.';
    if (!form.presentPostHeld.trim()) next.presentPostHeld = 'Present post held is required.';
    if (!form.placeOfPosting.trim()) next.placeOfPosting = 'Place of posting is required.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSaving(true);
    const payload: EmployeeRequest = {
      name: form.name.trim(),
      email: form.email.trim(),
      service: form.service.trim(),
      department: form.department.trim(),
      lengthOfService: form.lengthOfService.trim(),
      presentPostHeld: form.presentPostHeld.trim(),
      placeOfPosting: form.placeOfPosting.trim(),
    };

    try {
      if (editing) {
        const updated = await employeeApi.update(editing.id, payload);
        setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        showToast('Employee record updated.', 'success');
      } else {
        const created = await employeeApi.add(payload);
        setEmployees((prev) => [...prev, created]);
        showToast('Employee record added.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Could not save this employee record.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await employeeApi.remove(deleteTarget.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast('Employee record removed.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not remove this employee. They may still have linked IPR returns or a user account.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Employees</h1>
            <p className="text-sm text-gray-500">
              Manage employee records that staff can link to when registering an account.
            </p>
          </div>
          <Button
            onClick={openAddModal}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Employee
          </Button>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department, or post..."
            className="w-full sm:w-80 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          />

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={employees.length === 0 ? 'No employee records yet.' : 'No employees match your search.'}
              description={employees.length === 0 ? 'Add your first employee record to get started.' : undefined}
              action={
                employees.length === 0 ? (
                  <Button variant="outline" onClick={openAddModal}>
                    Add Employee
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Name</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Department</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Present Post</th>
                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 uppercase tracking-wide">Place of Posting</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-6 font-semibold text-gray-800">{emp.name}</td>
                      <td className="py-3 pr-6 text-gray-600">{emp.email}</td>
                      <td className="py-3 pr-6 text-gray-600">{emp.department}</td>
                      <td className="py-3 pr-6 text-gray-600">{emp.presentPostHeld}</td>
                      <td className="py-3 pr-6 text-gray-600">{emp.placeOfPosting}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(emp)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            Delete
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
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {submitError && (
                <div className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2.5">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <TextField
                  label="Name of the Employee (in full)"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  error={formErrors.name}
                  placeholder="e.g. Dr. Ananya Saha"
                />
                <TextField
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  error={formErrors.email}
                  placeholder="name@tripura.gov.in"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <TextField
                  label="Service"
                  required
                  value={form.service}
                  onChange={(e) => update('service', e.target.value)}
                  error={formErrors.service}
                  placeholder="e.g. Tripura Health Services"
                />
                <TextField
                  label="Department"
                  required
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  error={formErrors.department}
                  placeholder="e.g. Health & Family Welfare Department"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <TextField
                  label="Total Length of Service"
                  required
                  value={form.lengthOfService}
                  onChange={(e) => update('lengthOfService', e.target.value)}
                  error={formErrors.lengthOfService}
                  placeholder="e.g. 12 Years 6 Months"
                />
                <TextField
                  label="Present Post Held"
                  required
                  value={form.presentPostHeld}
                  onChange={(e) => update('presentPostHeld', e.target.value)}
                  error={formErrors.presentPostHeld}
                  placeholder="e.g. Medical Officer"
                />
                <TextField
                  label="Place of Posting"
                  required
                  value={form.placeOfPosting}
                  onChange={(e) => update('placeOfPosting', e.target.value)}
                  error={formErrors.placeOfPosting}
                  placeholder="e.g. District Hospital, West Tripura"
                />
              </div>
            </form>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isSaving}>
                {editing ? 'Save Changes' : 'Add Employee'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this employee record?"
        message={`This will permanently delete "${deleteTarget?.name ?? ''}" from the employee directory. They will no longer be able to register a new account against this record.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
