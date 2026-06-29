import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/Button';
import { SelectField, TextAreaField, TextField } from '@/components/FormFields';
import { OWNER_RELATIONS, ACQUISITION_MODES } from '@/types/property';
import type { PropertyRequest, PropertyResponse } from '@/types/property';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface PropertyFormModalProps {
  open: boolean;
  iprId: number;
  initial: PropertyResponse | null;
  onClose: () => void;
  onSubmit: (data: PropertyRequest) => Promise<void>;
}

type FormState = {
  locationAddress: string;
  propertyType: string;
  propertyDescription: string;
  acquisitionCost: string;
  acquisitionYear: string;
  presentValue: string;
  ownerName: string;
  ownerRelation: string;
  acquisitionMode: string;
  acquisitionDetails: string;
  annualIncome: string;
  remarks: string;
};

const emptyForm: FormState = {
  locationAddress: '',
  propertyType: '',
  propertyDescription: '',
  acquisitionCost: '',
  acquisitionYear: '',
  presentValue: '',
  ownerName: '',
  ownerRelation: '',
  acquisitionMode: '',
  acquisitionDetails: '',
  annualIncome: '',
  remarks: '',
};

export function PropertyFormModal({ open, iprId, initial, onClose, onSubmit }: PropertyFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        locationAddress: initial.locationAddress,
        propertyType: initial.propertyType,
        propertyDescription: initial.propertyDescription ?? '',
        acquisitionCost: initial.acquisitionCost?.toString() ?? '',
        acquisitionYear: initial.acquisitionYear?.toString() ?? '',
        presentValue: initial.presentValue?.toString() ?? '',
        ownerName: initial.ownerName,
        ownerRelation: initial.ownerRelation,
        acquisitionMode: initial.acquisitionMode ?? '',
        acquisitionDetails: initial.acquisitionDetails ?? '',
        annualIncome: initial.annualIncome?.toString() ?? '',
        remarks: initial.remarks ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setSubmitError(null);
  }, [initial, open]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.locationAddress.trim()) next.locationAddress = 'Location address is required.';
    if (!form.propertyType.trim()) next.propertyType = 'Property type is required.';
    if (!form.ownerName.trim()) next.ownerName = 'Owner name is required.';
    if (!form.ownerRelation.trim()) next.ownerRelation = 'Owner relation is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: PropertyRequest = {
        iprId,
        locationAddress: form.locationAddress.trim(),
        propertyType: form.propertyType.trim(),
        propertyDescription: form.propertyDescription.trim() || undefined,
        acquisitionCost: form.acquisitionCost ? Number(form.acquisitionCost) : undefined,
        acquisitionYear: form.acquisitionYear ? Number(form.acquisitionYear) : undefined,
        presentValue: form.presentValue ? Number(form.presentValue) : undefined,
        ownerName: form.ownerName.trim(),
        ownerRelation: form.ownerRelation,
        acquisitionMode: form.acquisitionMode || undefined,
        acquisitionDetails: form.acquisitionDetails.trim() || undefined,
        annualIncome: form.annualIncome ? Number(form.annualIncome) : undefined,
        remarks: form.remarks.trim() || undefined,
      };
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Could not save this property.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit Property' : 'Add Property'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
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

          <div className="grid grid-cols-1 gap-4 mb-4">
            <TextField
              label="Full Location & Postal Address"
              required
              value={form.locationAddress}
              onChange={(e) => update('locationAddress', e.target.value)}
              error={errors.locationAddress}
              placeholder="District, Sub-Division, Taluk & Village or City, PIN code"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TextField
              label="Name & Details of Property"
              required
              value={form.propertyType}
              onChange={(e) => update('propertyType', e.target.value)}
              error={errors.propertyType}
              placeholder="e.g. Residential House (Plot + Building)"
            />
            <TextField
              label="Property Description"
              value={form.propertyDescription}
              onChange={(e) => update('propertyDescription', e.target.value)}
              placeholder="Additional details (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextField
              label="Cost of Acquisition (₹)"
              type="number"
              min="0"
              value={form.acquisitionCost}
              onChange={(e) => update('acquisitionCost', e.target.value)}
              prefix="₹"
            />
            <TextField
              label="Year of Acquisition"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={form.acquisitionYear}
              onChange={(e) => update('acquisitionYear', e.target.value)}
              placeholder="e.g. 2018"
            />
            <TextField
              label="Present Value (₹)"
              type="number"
              min="0"
              value={form.presentValue}
              onChange={(e) => update('presentValue', e.target.value)}
              prefix="₹"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TextField
              label="Owner Name"
              required
              value={form.ownerName}
              onChange={(e) => update('ownerName', e.target.value)}
              error={errors.ownerName}
              placeholder="If not in own name, state in whose name held"
            />
            <SelectField
              label="Owner's Relationship"
              required
              value={form.ownerRelation}
              onChange={(e) => update('ownerRelation', e.target.value)}
              error={errors.ownerRelation}
              placeholder="Select relationship"
              options={OWNER_RELATIONS.map((r) => ({ value: r, label: r }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SelectField
              label="How Acquired"
              value={form.acquisitionMode}
              onChange={(e) => update('acquisitionMode', e.target.value)}
              placeholder="Select mode of acquisition"
              options={ACQUISITION_MODES.map((m) => ({ value: m, label: m }))}
            />
            <TextField
              label="Annual Income from Property (₹)"
              type="number"
              min="0"
              value={form.annualIncome}
              onChange={(e) => update('annualIncome', e.target.value)}
              prefix="₹"
            />
          </div>

          <div className="mb-4">
            <TextAreaField
              label="Acquisition Details"
              rows={2}
              value={form.acquisitionDetails}
              onChange={(e) => update('acquisitionDetails', e.target.value)}
              placeholder="Date of acquisition & name/details of person(s) from whom acquired"
            />
          </div>

          <div className="mb-2">
            <TextAreaField
              label="Remarks"
              rows={2}
              value={form.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              placeholder="Optional remarks"
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            {initial ? 'Save Changes' : 'Add Property'}
          </Button>
        </div>
      </div>
    </div>
  );
}
