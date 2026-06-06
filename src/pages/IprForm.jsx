import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getEmployeeById } from '../api/employeeApi';
import { getStoredEmployeeId } from '../utils/jwtHelper';
import {
  getIprReturnById,
  createIprReturn,
  updateIprReturn,
  submitIprReturn,
} from '../api/iprApi';
import {
  getPropertiesByIpr,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../api/propertyApi';
import {
  getDeclarationByIpr,
  createDeclaration,
  updateDeclaration,
} from '../api/declarationApi';
import { formatDate, formatINR, toInputDate, todayISO } from '../utils/formatters';

// ─── helpers ────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = ['House', 'Land', 'Flat', 'Other Buildings'];
const ACQUISITION_MODES = ['Purchase', 'Gift', 'Inheritance', 'Lease', 'Mortgage'];

const EMPTY_PROPERTY = {
  locationAddress: '',
  propertyType: 'House',
  propertyDescription: '',
  acquisitionCost: '',
  acquisitionYear: '',
  presentValue: '',
  ownerName: '',
  ownerRelation: '',
  acquisitionMode: 'Purchase',
  acquisitionDetails: '',
  annualIncome: '',
  remarks: '',
};

function RupeeInput({ value, onChange, placeholder, disabled, name }) {
  return (
    <div className="rupee-input-wrapper">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '0'}
        disabled={disabled}
        className="form-input pl-7"
        min="0"
      />
    </div>
  );
}

// ─── Property Modal ──────────────────────────────────────────────────────────
function PropertyModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_PROPERTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.locationAddress.trim()) { setErr('Location address is required.'); return; }
    if (!form.propertyType) { setErr('Property type is required.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave(form);
      onClose();
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save property.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-base">
            {initial?.propertyId ? 'Edit Property' : 'Add Property'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4">
          {err && <div className="bg-red-50 border border-red-300 text-red-700 rounded px-3 py-2 text-sm">{err}</div>}

          <div>
            <label className="form-label">Location Address <span className="text-red-500">*</span></label>
            <textarea
              name="locationAddress"
              value={form.locationAddress}
              onChange={handle}
              rows={2}
              placeholder="District, Sub-Division, Taluk, Village/City, Postal Code"
              className="form-input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Property Type <span className="text-red-500">*</span></label>
              <select name="propertyType" value={form.propertyType} onChange={handle} className="form-input">
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Acquisition Mode</label>
              <select name="acquisitionMode" value={form.acquisitionMode} onChange={handle} className="form-input">
                {ACQUISITION_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Property Description</label>
            <input type="text" name="propertyDescription" value={form.propertyDescription} onChange={handle} className="form-input" placeholder="Brief description of the property" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Acquisition Cost (₹)</label>
              <RupeeInput name="acquisitionCost" value={form.acquisitionCost} onChange={handle} />
            </div>
            <div>
              <label className="form-label">Acquisition Year</label>
              <input type="number" name="acquisitionYear" value={form.acquisitionYear} onChange={handle} className="form-input" placeholder="e.g. 2015" min="1900" max={new Date().getFullYear()} />
            </div>
          </div>

          <div>
            <label className="form-label">Present Value (₹)</label>
            <RupeeInput name="presentValue" value={form.presentValue} onChange={handle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Owner Name (if not self)</label>
              <input type="text" name="ownerName" value={form.ownerName} onChange={handle} className="form-input" placeholder="Name of owner" />
            </div>
            <div>
              <label className="form-label">Owner Relation</label>
              <input type="text" name="ownerRelation" value={form.ownerRelation} onChange={handle} className="form-input" placeholder="e.g. Spouse, Father" />
            </div>
          </div>

          <div>
            <label className="form-label">Acquisition Details</label>
            <textarea
              name="acquisitionDetails"
              value={form.acquisitionDetails}
              onChange={handle}
              rows={2}
              placeholder="From whom acquired, date of acquisition, etc."
              className="form-input resize-none"
            />
          </div>

          <div>
            <label className="form-label">Annual Income from Property (₹)</label>
            <RupeeInput name="annualIncome" value={form.annualIncome} onChange={handle} />
          </div>

          <div>
            <label className="form-label">Remarks</label>
            <input type="text" name="remarks" value={form.remarks} onChange={handle} className="form-input" placeholder="Any additional remarks" />
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ───────────────────────────────────────────────────────────
function PreviewModal({ ipr, profile, properties, declaration, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">IPR Return Preview — Form VI</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 space-y-6 text-sm">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <p className="font-bold text-base">GOVERNMENT OF TRIPURA</p>
            <p className="text-gray-600">IMMOVABLE PROPERTY RETURN — FORM VI</p>
            <p className="text-gray-500 text-xs mt-1">Under Rule-18 of the Tripura Civil Services (Conduct) Rules, 1988</p>
          </div>

          {/* Employee Details */}
          <div>
            <p className="font-semibold text-primary-700 border-b border-primary-200 pb-1 mb-3">Employee Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Name', profile?.name || profile?.employeeName],
                ['Service', profile?.service],
                ['Department', profile?.department],
                ['Present Post', profile?.presentPost || profile?.presentPostHeld],
                ['Place of Posting', profile?.placeOfPosting],
                ['Length of Service', profile?.lengthOfService],
                ['Reporting Year', ipr.reportingYear],
                ['As On Date', formatDate(ipr.asOnDate)],
                ['Total Annual Income', `₹ ${formatINR(ipr.totalAnnualIncome)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0">{l}:</span>
                  <span className="font-medium">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div>
            <p className="font-semibold text-primary-700 border-b border-primary-200 pb-1 mb-3">Immovable Properties ({properties.length})</p>
            {properties.length === 0 ? (
              <p className="text-gray-400 italic">No properties added.</p>
            ) : (
              <div className="space-y-3">
                {properties.map((p, i) => (
                  <div key={p.propertyId || i} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <p className="font-medium">{i + 1}. {p.propertyType} — {p.locationAddress}</p>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-gray-600">
                      <span>Acquisition Cost: ₹ {formatINR(p.acquisitionCost)}</span>
                      <span>Present Value: ₹ {formatINR(p.presentValue)}</span>
                      <span>Acquired: {p.acquisitionMode} ({p.acquisitionYear})</span>
                      <span>Annual Income: ₹ {formatINR(p.annualIncome)}</span>
                      {p.ownerName && <span>Owner: {p.ownerName} ({p.ownerRelation})</span>}
                      {p.remarks && <span>Remarks: {p.remarks}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Declaration */}
          <div>
            <p className="font-semibold text-primary-700 border-b border-primary-200 pb-1 mb-3">Declaration</p>
            <p className="text-gray-700 italic text-xs leading-relaxed">
              I hereby declare that the return enclosed namely, Form - VI are complete, true and correct as on{' '}
              <strong>{formatDate(ipr.asOnDate)}</strong> to the best of my knowledge and belief in respect of
              information due to be furnished by me under the provision of Rule-18 of the Tripura Civil Services
              (Conduct) Rules, 1988.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">Date: </span><span>{declaration?.declarationDate || todayISO()}</span></div>
              <div><span className="text-gray-500">Place: </span><span>{declaration?.place || '—'}</span></div>
            </div>
            <div className="mt-4 text-right">
              <p className="font-bold" style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#1a56db' }}>
                {profile?.name || profile?.employeeName || 'Employee'}
              </p>
              <p className="text-xs text-gray-500">(Signature / e-Sign)</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">Close Preview</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main IprForm ────────────────────────────────────────────────────────────
export default function IprForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  // State
  const [profile, setProfile] = useState(null);
  const [iprId, setIprId] = useState(id ? Number(id) : null);
  const [iprStatus, setIprStatus] = useState('DRAFT');
  const [totalAnnualIncome, setTotalAnnualIncome] = useState('');
  const [reportingYear, setReportingYear] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}-${String(y + 1).slice(-2)}`;
  });
  const [asOnDate, setAsOnDate] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}-12-31`;
  });

  const [properties, setProperties] = useState([]);
  const [propSearch, setPropSearch] = useState('');
  const [propPage, setPropPage] = useState(1);
  const PROP_PER_PAGE = 5;

  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const [declarationId, setDeclarationId] = useState(null);
  const [declChecked, setDeclChecked] = useState(false);
  const [declDate, setDeclDate] = useState(todayISO());
  const [declPlace, setDeclPlace] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isReadOnly = iprStatus === 'SUBMITTED' || iprStatus === 'APPROVED';

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const employeeId = getStoredEmployeeId();
        const profileRes = await getEmployeeById(employeeId);
        setProfile(profileRes.data);

        if (!isNew) {
          const iprRes = await getIprReturnById(id);
          const ipr = iprRes.data;
          setIprStatus(ipr.status || 'DRAFT');
          setTotalAnnualIncome(ipr.totalAnnualIncome || '');
          setReportingYear(ipr.reportingYear || '');
          setAsOnDate(toInputDate(ipr.asOnDate));

          const [propRes, declRes] = await Promise.allSettled([
            getPropertiesByIpr(id),
            getDeclarationByIpr(id),
          ]);
          if (propRes.status === 'fulfilled') {
            setProperties(Array.isArray(propRes.value.data) ? propRes.value.data : []);
          }
          if (declRes.status === 'fulfilled' && declRes.value.data) {
            const d = declRes.value.data;
            setDeclarationId(d.declarationId || d.id || null);
            setDeclChecked(!!d.declared);
            setDeclDate(toInputDate(d.declarationDate) || todayISO());
            setDeclPlace(d.place || '');
          }
        }
      } catch (e) {
        setError('Failed to load form data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  // ── Save IPR (create or update) ────────────────────────────────────────────
  const saveIpr = useCallback(async () => {
    const payload = {
      reportingYear,
      asOnDate,
      totalAnnualIncome: Number(totalAnnualIncome) || 0,
      status: 'DRAFT',
    };
    if (iprId) {
      const res = await updateIprReturn(iprId, payload);
      return res.data;
    } else {
      const res = await createIprReturn(payload);
      const created = res.data;
      setIprId(created.iprId);
      return created;
    }
  }, [iprId, reportingYear, asOnDate, totalAnnualIncome]);

  // ── Save Declaration ───────────────────────────────────────────────────────
  const saveDeclaration = useCallback(async (currentIprId) => {
    const payload = {
      declared: declChecked,
      declarationDate: declDate,
      place: declPlace,
      iprReturn: { iprId: currentIprId },
    };
    if (declarationId) {
      await updateDeclaration(declarationId, payload);
    } else {
      const res = await createDeclaration(payload);
      setDeclarationId(res.data?.declarationId || res.data?.id || null);
    }
  }, [declarationId, declChecked, declDate, declPlace]);

  // ── Handle Save as Draft ───────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const saved = await saveIpr();
      await saveDeclaration(saved.iprId || iprId);
      setSuccessMsg('Draft saved successfully.');
      if (isNew) navigate(`/ipr/${saved.iprId}`, { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  // ── Handle Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!declChecked) { setError('Please check the declaration before submitting.'); return; }
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const saved = await saveIpr();
      const currentId = saved.iprId || iprId;
      await saveDeclaration(currentId);
      await submitIprReturn(currentId);
      setIprStatus('SUBMITTED');
      setSuccessMsg('IPR Return submitted successfully!');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to submit IPR return.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Property CRUD ──────────────────────────────────────────────────────────
  const handleSaveProperty = async (formData) => {
    let currentIprId = iprId;
    if (!currentIprId) {
      const saved = await saveIpr();
      currentIprId = saved.iprId;
    }
    const payload = {
      ...formData,
      acquisitionCost: Number(formData.acquisitionCost) || 0,
      acquisitionYear: Number(formData.acquisitionYear) || null,
      presentValue: Number(formData.presentValue) || 0,
      annualIncome: Number(formData.annualIncome) || 0,
      iprReturn: { iprId: currentIprId },
    };
    if (editingProperty?.propertyId) {
      const res = await updateProperty(editingProperty.propertyId, payload);
      setProperties((prev) =>
        prev.map((p) => p.propertyId === editingProperty.propertyId ? res.data : p)
      );
    } else {
      const res = await createProperty(payload);
      setProperties((prev) => [...prev, res.data]);
    }
    setEditingProperty(null);
  };

  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await deleteProperty(propId);
      setProperties((prev) => prev.filter((p) => p.propertyId !== propId));
    } catch {
      alert('Failed to delete property.');
    }
  };

  // ── Filtered + paginated properties ───────────────────────────────────────
  const filteredProps = properties.filter((p) =>
    !propSearch ||
    (p.locationAddress || '').toLowerCase().includes(propSearch.toLowerCase()) ||
    (p.propertyType || '').toLowerCase().includes(propSearch.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProps.length / PROP_PER_PAGE);
  const pagedProps = filteredProps.slice((propPage - 1) * PROP_PER_PAGE, propPage * PROP_PER_PAGE);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout title="IPR Filing Form">
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="IPR Filing Form">
      {/* Modals */}
      {showPropertyModal && (
        <PropertyModal
          initial={editingProperty}
          onSave={handleSaveProperty}
          onClose={() => { setShowPropertyModal(false); setEditingProperty(null); }}
        />
      )}
      {showPreview && (
        <PreviewModal
          ipr={{ reportingYear, asOnDate, totalAnnualIncome }}
          profile={profile}
          properties={properties}
          declaration={{ declarationDate: declDate, place: declPlace }}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Immovable Property Return — Form VI</h2>
          <p className="text-xs text-gray-500 mt-0.5">Under Rule-18 of the Tripura Civil Services (Conduct) Rules, 1988</p>
        </div>
        {iprId && <StatusBadge status={iprStatus} />}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-300 text-green-700 rounded-md px-4 py-3 text-sm">{successMsg}</div>
      )}

      {/* ── SECTION 1: Employee Details ── */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">Section 1 — Employee Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Name of the Employee (in full)</label>
            <input type="text" className="form-input" value={profile?.name || profile?.employeeName || ''} disabled />
          </div>
          <div>
            <label className="form-label">Service</label>
            <input type="text" className="form-input" value={profile?.service || ''} disabled />
          </div>
          <div>
            <label className="form-label">Department</label>
            <input type="text" className="form-input" value={profile?.department || ''} disabled />
          </div>
          <div>
            <label className="form-label">Total Length of Services</label>
            <input type="text" className="form-input" value={profile?.lengthOfService || ''} disabled />
          </div>
          <div>
            <label className="form-label">Present Post Held</label>
            <input type="text" className="form-input" value={profile?.presentPost || profile?.presentPostHeld || ''} disabled />
          </div>
          <div>
            <label className="form-label">Place of Posting</label>
            <input type="text" className="form-input" value={profile?.placeOfPosting || ''} disabled />
          </div>

          {/* Editable fields */}
          <div>
            <label className="form-label">Reporting Year <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-input"
              value={reportingYear}
              onChange={(e) => setReportingYear(e.target.value)}
              placeholder="e.g. 2025-26"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="form-label">As On Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              className="form-input"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">
              Total Annual Income from all sources during the calendar year (₹)
              <span className="text-red-500"> *</span>
            </label>
            <div className="rupee-input-wrapper">
              <input
                type="number"
                className="form-input pl-7"
                value={totalAnnualIncome}
                onChange={(e) => setTotalAnnualIncome(e.target.value)}
                placeholder="0"
                min="0"
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Immovable Properties ── */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">Section 2 — Details of Immovable Property</h3>

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search properties..."
            value={propSearch}
            onChange={(e) => { setPropSearch(e.target.value); setPropPage(1); }}
            className="form-input w-64"
          />
          {!isReadOnly && (
            <button
              onClick={() => { setEditingProperty(null); setShowPropertyModal(true); }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="table-header w-8">Sr.</th>
                <th className="table-header">Location (District, Sub-Division, Taluk, Village/City)</th>
                <th className="table-header">Name &amp; Details of Property</th>
                <th className="table-header">Cost of Acquisition (₹) &amp; Year</th>
                <th className="table-header">Present Value (₹)</th>
                <th className="table-header">Owner (if not self) &amp; Relation</th>
                <th className="table-header">How Acquired &amp; Details</th>
                <th className="table-header">Annual Income (₹)</th>
                <th className="table-header">Remarks</th>
                {!isReadOnly && <th className="table-header">Action</th>}
              </tr>
            </thead>
            <tbody>
              {pagedProps.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 9 : 10} className="text-center py-8 text-gray-400">
                    No properties added yet.
                  </td>
                </tr>
              ) : (
                pagedProps.map((p, i) => (
                  <tr key={p.propertyId || i} className="hover:bg-gray-50">
                    <td className="table-cell text-center">{(propPage - 1) * PROP_PER_PAGE + i + 1}</td>
                    <td className="table-cell max-w-xs">
                      <span className="line-clamp-2">{p.locationAddress || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium">{p.propertyType}</span>
                      {p.propertyDescription && <span className="block text-gray-400">{p.propertyDescription}</span>}
                    </td>
                    <td className="table-cell">
                      ₹ {formatINR(p.acquisitionCost)}
                      {p.acquisitionYear && <span className="block text-gray-400">({p.acquisitionYear})</span>}
                    </td>
                    <td className="table-cell">₹ {formatINR(p.presentValue)}</td>
                    <td className="table-cell">
                      {p.ownerName ? (
                        <><span>{p.ownerName}</span><span className="block text-gray-400">{p.ownerRelation}</span></>
                      ) : <span className="text-gray-400">Self</span>}
                    </td>
                    <td className="table-cell">
                      <span className="font-medium">{p.acquisitionMode}</span>
                      {p.acquisitionDetails && <span className="block text-gray-400 line-clamp-2">{p.acquisitionDetails}</span>}
                    </td>
                    <td className="table-cell">₹ {formatINR(p.annualIncome)}</td>
                    <td className="table-cell">{p.remarks || '—'}</td>
                    {!isReadOnly && (
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingProperty(p); setShowPropertyModal(true); }}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(p.propertyId)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProps.length > 0 && (
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>
              Showing {Math.min((propPage - 1) * PROP_PER_PAGE + 1, filteredProps.length)} to{' '}
              {Math.min(propPage * PROP_PER_PAGE, filteredProps.length)} of {filteredProps.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPropPage((p) => Math.max(1, p - 1))}
                disabled={propPage === 1}
                className="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPropPage(pg)}
                  className={`px-2 py-1 border rounded ${
                    pg === propPage ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >{pg}</button>
              ))}
              <button
                onClick={() => setPropPage((p) => Math.min(totalPages, p + 1))}
                disabled={propPage === totalPages || totalPages === 0}
                className="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Declaration ── */}
      <div className="card p-5 mb-6">
        <h3 className="section-title">Section 3 — Declaration</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declChecked}
              onChange={(e) => setDeclChecked(e.target.checked)}
              disabled={isReadOnly}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded flex-shrink-0"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              I hereby declare that the return enclosed namely, Form - VI are complete, true and correct as on{' '}
              <strong>{formatDate(asOnDate)}</strong> to the best of my knowledge and belief in respect of
              information due to be furnished by me under the provision of Rule-18 of the Tripura Civil Services
              (Conduct) Rules, 1988.
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={declDate}
              onChange={(e) => setDeclDate(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="form-label">Place</label>
            <input
              type="text"
              className="form-input"
              value={declPlace}
              onChange={(e) => setDeclPlace(e.target.value)}
              placeholder="e.g. Agartala"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Signature Box */}
        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
          <p
            className="text-2xl text-primary-700 mb-1"
            style={{ fontFamily: 'cursive' }}
          >
            {profile?.name || profile?.employeeName || 'Employee Name'}
          </p>
          <p className="text-xs text-gray-500 mb-3">Signature of the Government Servant</p>
          <button
            type="button"
            disabled
            className="text-xs bg-gray-200 text-gray-500 px-4 py-1.5 rounded border border-gray-300 cursor-not-allowed"
          >
            e-Sign (Coming Soon)
          </button>
        </div>
      </div>

      {/* ── Bottom Action Buttons ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          {!isReadOnly && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="btn-secondary"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={!declChecked || submitting}
              className="btn-success flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
