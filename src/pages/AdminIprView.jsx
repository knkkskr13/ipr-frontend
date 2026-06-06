import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getIprReturnById, approveIprReturn } from '../api/iprApi';
import { getPropertiesByIpr } from '../api/propertyApi';
import { getDeclarationByIpr } from '../api/declarationApi';
import { formatDate, formatINR } from '../utils/formatters';

export default function AdminIprView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ipr, setIpr] = useState(null);
  const [properties, setProperties] = useState([]);
  const [declaration, setDeclaration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const iprRes = await getIprReturnById(id);
        setIpr(iprRes.data);
        const [propRes, declRes] = await Promise.allSettled([
          getPropertiesByIpr(id),
          getDeclarationByIpr(id),
        ]);
        if (propRes.status === 'fulfilled') setProperties(Array.isArray(propRes.value.data) ? propRes.value.data : []);
        if (declRes.status === 'fulfilled') setDeclaration(declRes.value.data || null);
      } catch {
        setError('Failed to load IPR return details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm('Approve this IPR return?')) return;
    setApproving(true);
    try {
      const res = await approveIprReturn(id);
      setIpr(res.data);
      setSuccessMsg('IPR Return approved successfully!');
    } catch {
      setError('Failed to approve.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return (
    <Layout title="View IPR Return">
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    </Layout>
  );

  const emp = ipr?.employee;

  return (
    <Layout title="View IPR Return">
      {error && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}
      {successMsg && <div className="mb-4 bg-green-50 border border-green-300 text-green-700 rounded-md px-4 py-3 text-sm">{successMsg}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">IPR Return — Form VI</h2>
          <p className="text-xs text-gray-500 mt-0.5">Under Rule-18 of the Tripura Civil Services (Conduct) Rules, 1988</p>
        </div>
        <div className="flex items-center gap-3">
          {ipr && <StatusBadge status={ipr.status} />}
          {ipr?.status === 'SUBMITTED' && (
            <button onClick={handleApprove} disabled={approving}
              className="btn-success flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {approving ? 'Approving...' : 'Approve'}
            </button>
          )}
        </div>
      </div>

      {/* Section 1 — Employee Details */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">Section 1 — Employee Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['Name', emp?.name],
            ['Service', emp?.service],
            ['Department', emp?.department],
            ['Present Post Held', emp?.presentPostHeld],
            ['Place of Posting', emp?.placeOfPosting],
            ['Length of Service', emp?.lengthOfService],
            ['Reporting Year', ipr?.reportingYear],
            ['As On Date', formatDate(ipr?.asOnDate)],
            ['Total Annual Income', `₹ ${formatINR(ipr?.totalAnnualIncome)}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-sm text-gray-800 font-semibold mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 — Properties */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">Section 2 — Details of Immovable Property ({properties.length})</h3>
        {properties.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No properties declared.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="table-header w-8">Sr.</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Acquisition Cost (₹) & Year</th>
                  <th className="table-header">Present Value (₹)</th>
                  <th className="table-header">Owner (if not self)</th>
                  <th className="table-header">How Acquired</th>
                  <th className="table-header">Annual Income (₹)</th>
                  <th className="table-header">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p, i) => (
                  <tr key={p.propertyId || i} className="hover:bg-gray-50">
                    <td className="table-cell text-center">{i + 1}</td>
                    <td className="table-cell max-w-xs"><span className="line-clamp-2">{p.locationAddress || '—'}</span></td>
                    <td className="table-cell font-medium">{p.propertyType || '—'}</td>
                    <td className="table-cell">₹ {formatINR(p.acquisitionCost)}{p.acquisitionYear && <span className="block text-gray-400">({p.acquisitionYear})</span>}</td>
                    <td className="table-cell">₹ {formatINR(p.presentValue)}</td>
                    <td className="table-cell">{p.ownerName ? <><span>{p.ownerName}</span><span className="block text-gray-400">{p.ownerRelation}</span></> : <span className="text-gray-400">Self</span>}</td>
                    <td className="table-cell"><span className="font-medium">{p.acquisitionMode}</span>{p.acquisitionDetails && <span className="block text-gray-400 line-clamp-2">{p.acquisitionDetails}</span>}</td>
                    <td className="table-cell">₹ {formatINR(p.annualIncome)}</td>
                    <td className="table-cell">{p.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3 — Declaration */}
      <div className="card p-5 mb-6">
        <h3 className="section-title">Section 3 — Declaration</h3>
        {declaration ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className={`mt-1 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${
                  declaration.agreed ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {declaration.agreed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{declaration.declarationText}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Date</p>
                <p className="text-sm font-semibold">{formatDate(declaration.declarationDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Place</p>
                <p className="text-sm font-semibold">{declaration.place || '—'}</p>
              </div>
            </div>
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <p className="text-2xl text-primary-700" style={{ fontFamily: 'cursive' }}>
                {declaration.employeeSignature || emp?.name || '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Signature of the Government Servant</p>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm italic">No declaration submitted yet.</p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin')} className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        {ipr?.status === 'SUBMITTED' && (
          <button onClick={handleApprove} disabled={approving} className="btn-success flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {approving ? 'Approving...' : 'Approve this Return'}
          </button>
        )}
      </div>
    </Layout>
  );
}
