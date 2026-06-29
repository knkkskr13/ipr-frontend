import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { TextField } from '@/components/FormFields';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { iprReturnApi } from '@/api/iprReturn';
import { propertyApi } from '@/api/property';
import { declarationApi } from '@/api/declaration';
import type { IprReturnResponse } from '@/types/iprReturn';
import type { PropertyRequest, PropertyResponse } from '@/types/property';
import type { IprDeclarationResponse } from '@/types/declaration';
import { DEFAULT_DECLARATION_TEXT } from '@/types/declaration';
import { formatCurrency, formatDate, todayIso, currentReportingYear } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function IprReturnFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [iprReturn, setIprReturn] = useState<IprReturnResponse | null>(null);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [declaration, setDeclaration] = useState<IprDeclarationResponse | null>(null);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Top-level form fields (employee details are read-only / from profile)
  const [reportingYear, setReportingYear] = useState(currentReportingYear());
  const [asOnDate, setAsOnDate] = useState(todayIso());
  const [totalAnnualIncome, setTotalAnnualIncome] = useState('');
  const [isNoProperty, setIsNoProperty] = useState(false);

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Declaration fields
  const [declDate, setDeclDate] = useState(todayIso());
  const [declPlace, setDeclPlace] = useState('');
  const [declSignature, setDeclSignature] = useState(user?.employee?.name ?? '');
  const [declAgreed, setDeclAgreed] = useState(false);

  // Property modal state
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PropertyResponse | null>(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employee = user?.employee;
  const isReadOnly = iprReturn ? iprReturn.status !== 'DRAFT' : false;

  // Load existing IPR return + properties + declaration if editing
  useEffect(() => {
    if (isNew) return;
    let active = true;
    setIsLoading(true);

    const iprId = Number(id);
    Promise.all([
      iprReturnApi.getById(iprId),
      propertyApi.getByIprId(iprId),
      declarationApi.getByIprId(iprId).catch(() => null),
    ])
      .then(([returnData, propertiesData, declarationData]) => {
        if (!active) return;
        setIprReturn(returnData);
        setProperties(propertiesData);
        setReportingYear(returnData.reportingYear);
        setAsOnDate(returnData.asOnDate);
        setTotalAnnualIncome(returnData.totalAnnualIncome?.toString() ?? '');
        setIsNoProperty(returnData.isNoProperty);

        if (declarationData) {
          setDeclaration(declarationData);
          setDeclDate(declarationData.declarationDate);
          setDeclPlace(declarationData.place);
          setDeclSignature(declarationData.employeeSignature);
          setDeclAgreed(declarationData.agreed);
        }
      })
      .catch((err) => {
        if (active) setLoadError(getErrorMessage(err, 'Could not load this IPR return.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isNew]);

  // --- Save / create the IprReturn record (draft) ---
  async function handleSaveDraft(): Promise<IprReturnResponse | null> {
    if (!reportingYear.trim()) {
      showToast('Reporting year is required.', 'error');
      return null;
    }
    if (!asOnDate) {
      showToast('As-on date is required.', 'error');
      return null;
    }
    if (!totalAnnualIncome) {
      showToast('Total annual income must be disclosed.', 'error');
      return null;
    }

    setIsSavingDraft(true);
    try {
      if (iprReturn) {
        const updated = await iprReturnApi.update(iprReturn.iprId, {
          reportingYear: reportingYear.trim(),
          asOnDate,
          totalAnnualIncome: Number(totalAnnualIncome),
          isNoProperty,
        });
        setIprReturn(updated);
        showToast('Draft saved.', 'success');
        return updated;
      } else {
        if (!employee) {
          showToast('Your account is not linked to an employee record.', 'error');
          return null;
        }
        const created = await iprReturnApi.add({
          employeeId: employee.id,
          reportingYear: reportingYear.trim(),
          asOnDate,
          totalAnnualIncome: Number(totalAnnualIncome),
          isNoProperty,
        });
        setIprReturn(created);
        showToast('Draft created.', 'success');
        navigate(`/my-returns/${created.iprId}`, { replace: true });
        return created;
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save your IPR return.'), 'error');
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSaveDraftClick(e: FormEvent) {
    e.preventDefault();
    await handleSaveDraft();
  }

  // --- Property CRUD ---
  function openAddProperty() {
    setEditingProperty(null);
    setPropertyModalOpen(true);
  }

  function openEditProperty(property: PropertyResponse) {
    setEditingProperty(property);
    setPropertyModalOpen(true);
  }

  async function handlePropertySubmit(data: PropertyRequest) {
    let activeIprId = iprReturn?.iprId;

    if (!activeIprId) {
      const saved = await handleSaveDraft();
      if (!saved) throw new Error('Save the IPR return details before adding a property.');
      activeIprId = saved.iprId;
    }

    if (editingProperty) {
      const updated = await propertyApi.update(editingProperty.propertyId, {
        ...data,
        iprId: activeIprId,
      });
      setProperties((prev) =>
        prev.map((p) => (p.propertyId === updated.propertyId ? updated : p)),
      );
      showToast('Property updated.', 'success');
    } else {
      const created = await propertyApi.add({ ...data, iprId: activeIprId });
      setProperties((prev) => [...prev, created]);
      showToast('Property added.', 'success');
    }
    setPropertyModalOpen(false);
  }

  async function handleDeleteProperty() {
    if (!deleteTarget) return;
    setIsDeletingProperty(true);
    try {
      await propertyApi.remove(deleteTarget.propertyId);
      setProperties((prev) => prev.filter((p) => p.propertyId !== deleteTarget.propertyId));
      showToast('Property removed.', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not remove this property.'), 'error');
    } finally {
      setIsDeletingProperty(false);
    }
  }

  // --- Declaration + Submit ---
  async function handleSubmitReturn() {
    if (!declAgreed) {
      showToast('You must agree to the declaration before submitting.', 'error');
      setSubmitConfirmOpen(false);
      return;
    }
    if (!declPlace.trim() || !declSignature.trim()) {
      showToast('Place and signature are required for the declaration.', 'error');
      setSubmitConfirmOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await handleSaveDraft();
      if (!saved) {
        setIsSubmitting(false);
        return;
      }

      const declarationPayload = {
        iprId: saved.iprId,
        declarationText: DEFAULT_DECLARATION_TEXT,
        agreed: declAgreed,
        declarationDate: declDate,
        place: declPlace.trim(),
        employeeSignature: declSignature.trim(),
      };

      if (declaration) {
        await declarationApi.update(declaration.declarationId, declarationPayload);
      } else {
        await declarationApi.add(declarationPayload);
      }

      const submitted = await iprReturnApi.submit(saved.iprId);
      setIprReturn(submitted);
      showToast('IPR return submitted successfully.', 'success');
      setSubmitConfirmOpen(false);
      navigate(`/my-returns/${submitted.iprId}`, { replace: true });
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not submit your IPR return.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {loadError}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        {/* Title */}
        <div className="flex items-start gap-3 mb-5">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Annual Return on Immovable Property Returns (IPR)
              </h1>
              <p className="text-sm text-gray-600 font-bold mt-2">
                (As on {formatDate(asOnDate)})
                <span className="ml-1">(Rule-18, Tripura Civil Services (Conduct) Rules, 1988)</span>
              </p>
            </div>
            {iprReturn && <StatusBadge status={iprReturn.status} />}
          </div>
        </div>

        {isReadOnly && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
            This return has been {iprReturn?.status.toLowerCase()} and can no longer be edited.
          </div>
        )}

        {/* Employee details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-2">
          <h2 className="text-sm font-bold text-blue-700 tracking-wide mb-5">1. EMPLOYEE DETAILS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            <ReadOnlyField label="Name of the Employee (in full)" value={employee?.name} />
            <ReadOnlyField label="Service" value={employee?.service} />
            <ReadOnlyField label="Department" value={employee?.department} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            <ReadOnlyField label="Total Length of Services" value={employee?.lengthOfService} />
            <ReadOnlyField label="Present Post Held" value={employee?.presentPostHeld} />
            <ReadOnlyField label="Place of Posting" value={employee?.placeOfPosting} />
          </div>

          <form onSubmit={handleSaveDraftClick}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TextField
                label="Total Annual Income from all sources (₹)"
                required
                type="number"
                min="0"
                prefix="₹"
                value={totalAnnualIncome}
                onChange={(e) => setTotalAnnualIncome(e.target.value)}
                disabled={isReadOnly}
              />
              <TextField
                label="Reporting Year"
                required
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
                placeholder="e.g. 2025-26"
                disabled={isReadOnly}
              />
              <TextField
                label="As on Date"
                required
                type="date"
                value={asOnDate}
                onChange={(e) => setAsOnDate(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <label className="flex items-center gap-2 mt-5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isNoProperty}
                onChange={(e) => setIsNoProperty(e.target.checked)}
                disabled={isReadOnly}
                className="w-4 h-4 accent-blue-600"
              />
              I have no immovable property to declare this year
            </label>

            {!isReadOnly && (
              <div className="mt-5">
                <Button type="submit" variant="outline" isLoading={isSavingDraft} icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                  </svg>
                }>
                  Save as Draft
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Property details */}
        {!isNoProperty && (
          <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-blue-700 tracking-wide mb-4">
              2. DETAILS OF IMMOVABLE PROPERTY
            </h2>

            {!isReadOnly && (
              <div className="flex items-center justify-between mb-4">
                <Button onClick={openAddProperty} icon={<span className="text-lg leading-none">+</span>}>
                  Add Property
                </Button>
              </div>
            )}

            {properties.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">
                No properties added yet.{!isReadOnly && ' Click "Add Property" to declare your first one.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-700">
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top w-12">Sr. No.</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[180px]">Location & Postal Address</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[140px]">Property Details</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[140px]">Cost / Year</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[110px]">Present Value</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[150px]">Owner & Relation</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[160px]">How Acquired</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[100px]">Annual Income</th>
                      <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top min-w-[80px]">Remarks</th>
                      {!isReadOnly && (
                        <th className="px-3 py-3 border-b border-gray-200 font-semibold align-top w-20">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p, idx) => (
                      <tr key={p.propertyId} className="border-b border-gray-200 align-top">
                        <td className="px-3 py-3 text-gray-700">{idx + 1}</td>
                        <td className="px-3 py-3 text-gray-700">{p.locationAddress}</td>
                        <td className="px-3 py-3 text-gray-700">{p.propertyType}</td>
                        <td className="px-3 py-3 text-gray-700">
                          {formatCurrency(p.acquisitionCost)}
                          {p.acquisitionYear ? ` (${p.acquisitionYear})` : ''}
                        </td>
                        <td className="px-3 py-3 text-gray-700">{formatCurrency(p.presentValue)}</td>
                        <td className="px-3 py-3 text-gray-700">
                          {p.ownerName} ({p.ownerRelation})
                        </td>
                        <td className="px-3 py-3 text-gray-700">
                          {p.acquisitionMode || '—'}
                          {p.acquisitionDetails ? ` — ${p.acquisitionDetails}` : ''}
                        </td>
                        <td className="px-3 py-3 text-gray-700">{formatCurrency(p.annualIncome)}</td>
                        <td className="px-3 py-3 text-gray-700">{p.remarks || '-'}</td>
                        {!isReadOnly && (
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditProperty(p)}
                                className="text-blue-600 hover:text-blue-800"
                                aria-label="Edit property"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Delete property"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Declaration */}
        <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-blue-700 tracking-wide mb-4">3. DECLARATION</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1.2fr] gap-4 items-start">
            <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <input
                type="checkbox"
                checked={declAgreed}
                onChange={(e) => setDeclAgreed(e.target.checked)}
                disabled={isReadOnly}
                className="flex-shrink-0 w-4 h-5 mt-1 accent-green-600 cursor-pointer"
              />
              <p className="text-sm text-gray-700 leading-relaxed">{DEFAULT_DECLARATION_TEXT}</p>
            </div>

            <TextField
              label="Date"
              type="date"
              value={declDate}
              onChange={(e) => setDeclDate(e.target.value)}
              disabled={isReadOnly}
            />

            <TextField
              label="Place"
              value={declPlace}
              onChange={(e) => setDeclPlace(e.target.value)}
              placeholder="e.g. Agartala"
              disabled={isReadOnly}
            />

            <TextField
              label="Signature (e-Sign)"
              value={declSignature}
              onChange={(e) => setDeclSignature(e.target.value)}
              placeholder="Type your full name"
              disabled={isReadOnly}
              className="italic font-serif"
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('/my-returns')} icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }>
            Back to My Returns
          </Button>

          {!isReadOnly && (
            <div className="flex items-center gap-3">
              <Button variant="outline" isLoading={isSavingDraft} onClick={handleSaveDraft} icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                  <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                </svg>
              }>
                Save as Draft
              </Button>

              <Button variant="success" onClick={() => setSubmitConfirmOpen(true)} icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              }>
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>

      <PropertyFormModal
        open={propertyModalOpen}
        iprId={iprReturn?.iprId ?? 0}
        initial={editingProperty}
        onClose={() => setPropertyModalOpen(false)}
        onSubmit={handlePropertySubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this property?"
        message={`This will permanently delete "${deleteTarget?.propertyType ?? ''}" from your IPR return.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeletingProperty}
        onConfirm={handleDeleteProperty}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={submitConfirmOpen}
        title="Submit IPR Return?"
        message="Once submitted, this return will be locked for editing and sent to the Admin for review. Make sure all details are correct."
        confirmLabel="Submit"
        variant="success"
        isLoading={isSubmitting}
        onConfirm={handleSubmitReturn}
        onCancel={() => setSubmitConfirmOpen(false)}
      />
    </AppLayout>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">{label}</label>
      <div className="w-full bg-gray-100 rounded-lg px-3 py-2.5 text-gray-800 border border-gray-300">
        {value || '—'}
      </div>
    </div>
  );
}
