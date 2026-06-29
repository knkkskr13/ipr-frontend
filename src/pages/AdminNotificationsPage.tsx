import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';
import { TextAreaField, TextField } from '@/components/FormFields';
import { useToast } from '@/context/ToastContext';
import { notificationApi } from '@/api/notification';
import type { IprNotificationRequest, IprNotificationResponse } from '@/types/notification';
import { formatDate, formatDateTime, todayIso } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

type FormState = {
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

const emptyForm: FormState = {
  title: '',
  message: '',
  startDate: todayIso(),
  endDate: todayIso(),
  active: true,
};

function isWindowOpen(n: IprNotificationResponse): boolean {
  if (!n.active) return false;
  const today = todayIso();
  return today >= n.startDate && today <= n.endDate;
}

export function AdminNotificationsPage() {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<IprNotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IprNotificationResponse | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<IprNotificationResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    setIsLoading(true);
    setError(null);
    notificationApi
      .getAll()
      .then(setNotifications)
      .catch((err) => setError(getErrorMessage(err, 'Could not load filing window notifications.')))
      .finally(() => setIsLoading(false));
  }

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [notifications],
  );

  const hasActiveNotification = notifications.some((n) => n.active);

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setSubmitError(null);
    setModalOpen(true);
  }

  function openEditModal(n: IprNotificationResponse) {
    setEditing(n);
    setForm({
      title: n.title,
      message: n.message,
      startDate: n.startDate,
      endDate: n.endDate,
      active: n.active,
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
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.message.trim()) next.message = 'Message is required.';
    if (!form.startDate) next.startDate = 'Start date is required.';
    if (!form.endDate) next.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = 'End date cannot be before the start date.';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSaving(true);
    const payload: IprNotificationRequest = {
      title: form.title.trim(),
      message: form.message.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active,
    };

    try {
      if (editing) {
        const updated = await notificationApi.update(editing.id, payload);
        setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        showToast('Filing window updated.', 'success');
      } else {
        const created = await notificationApi.create(payload);
        setNotifications((prev) => [...prev, created]);
        showToast('Filing window created.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      setSubmitError(
        getErrorMessage(
          err,
          'Could not save this filing window. Only one active filing window is allowed at a time.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await notificationApi.remove(deleteTarget.id);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      showToast('Filing window removed.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not remove this filing window.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleActive(n: IprNotificationResponse) {
    try {
      const updated = await notificationApi.update(n.id, {
        title: n.title,
        message: n.message,
        startDate: n.startDate,
        endDate: n.endDate,
        active: !n.active,
      });
      setNotifications((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      showToast(updated.active ? 'Filing window activated.' : 'Filing window deactivated.', 'success');
    } catch (err) {
      showToast(
        getErrorMessage(err, 'Could not change this filing window. Only one active window is allowed at a time.'),
        'error',
      );
    }
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Filing Window</h1>
            <p className="text-sm text-gray-500">
              Control when employees can file, edit, or submit their annual IPR returns.
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            disabled={hasActiveNotification}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Filing Window
          </Button>
        </div>

        {hasActiveNotification && (
          <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
            An active filing window already exists. Deactivate it before creating a new one.
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-blue-600" />
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No filing windows have been configured."
              description="Create one so employees can start filing their annual returns."
              action={
                <Button variant="outline" onClick={openCreateModal}>
                  New Filing Window
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {sorted.map((n) => {
                const open = isWindowOpen(n);
                return (
                  <div
                    key={n.id}
                    className={`rounded-xl border p-4 flex items-start justify-between gap-4 flex-wrap ${
                      n.active
                        ? open
                          ? 'bg-green-50 border-green-200'
                          : 'bg-yellow-50 border-yellow-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{n.title}</p>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                            n.active
                              ? open
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                              : 'bg-gray-100 text-gray-500 border-gray-300'
                          }`}
                        >
                          {n.active ? (open ? 'Active — Open Now' : 'Active — Not in Range') : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-1">{n.message}</p>
                      <p className="text-xs text-gray-500">
                        Window: {formatDate(n.startDate)} – {formatDate(n.endDate)}
                        {' · '}Last updated {formatDateTime(n.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(n)}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {n.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(n)}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(n)}
                        className="text-sm font-semibold text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Filing Window' : 'New Filing Window'}
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

              <div className="mb-4">
                <TextField
                  label="Title"
                  required
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  error={formErrors.title}
                  placeholder="e.g. Annual IPR Filing for 2025-26 is Open"
                />
              </div>

              <div className="mb-4">
                <TextAreaField
                  label="Message"
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  error={formErrors.message}
                  placeholder="Tell employees what they need to do and by when."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <TextField
                  label="Start Date"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  error={formErrors.startDate}
                />
                <TextField
                  label="End Date"
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  error={formErrors.endDate}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update('active', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Activate this filing window
              </label>
            </form>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isSaving}>
                {editing ? 'Save Changes' : 'Create Filing Window'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this filing window?"
        message={`This will permanently remove "${deleteTarget?.title ?? ''}". Employees will no longer see this notification.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
