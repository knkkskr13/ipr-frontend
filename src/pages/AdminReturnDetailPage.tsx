import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { iprReturnApi } from '@/api/iprReturn';
import { propertyApi } from '@/api/property';
import { declarationApi } from '@/api/declaration';
import type { IprReturnResponse } from '@/types/iprReturn';
import type { PropertyResponse } from '@/types/property';
import type { IprDeclarationResponse } from '@/types/declaration';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function AdminReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [iprReturn, setIprReturn] = useState<IprReturnResponse | null>(null);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [declaration, setDeclaration] = useState<IprDeclarationResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (!id) return;
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
        setDeclaration(declarationData);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load this IPR return.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function handleApprove() {
    if (!iprReturn) return;
    setIsApproving(true);
    try {
      const updated = await iprReturnApi.approve(iprReturn.iprId);
      setIprReturn(updated);
      showToast('IPR return approved.', 'success');
      setApproveConfirmOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not approve this return.'), 'error');
    } finally {
      setIsApproving(false);
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

  if (error || !iprReturn) {
    return (
      <AppLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error ?? 'IPR return not found.'}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {iprReturn.employeeName} — {iprReturn.reportingYear}
            </h1>
            <p className="text-sm text-gray-500">
              {iprReturn.employeePresentPostHeld}, {iprReturn.employeeDepartment}
            </p>
          </div>
          <StatusBadge status={iprReturn.status} />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-2">
          <h2 className="text-sm font-bold text-blue-700 tracking-wide mb-5">RETURN SUMMARY</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryField label="Reporting Year" value={iprReturn.reportingYear} />
            <SummaryField label="As On Date" value={formatDate(iprReturn.asOnDate)} />
            <SummaryField label="Total Annual Income" value={formatCurrency(iprReturn.totalAnnualIncome)} />
            <SummaryField label="No Property Declared" value={iprReturn.isNoProperty ? 'Yes' : 'No'} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
            <SummaryField label="Created" value={formatDateTime(iprReturn.createdAt)} />
            <SummaryField label="Submitted" value={formatDateTime(iprReturn.submittedAt)} />
            <SummaryField label="Approved" value={formatDateTime(iprReturn.approvedAt)} />
          </div>
        </div>

        {/* Properties */}
        <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-blue-700 tracking-wide mb-4">
            DECLARED IMMOVABLE PROPERTY ({properties.length})
          </h2>

          {properties.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No properties declared.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-700">
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold w-12">Sr. No.</th>
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold min-w-[180px]">Location</th>
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold min-w-[140px]">Property</th>
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold min-w-[120px]">Cost / Year</th>
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold min-w-[110px]">Present Value</th>
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold min-w-[140px]">Owner & Relation</th>
                    <th className="px-3 py-3 border-b border-gray-200 font-semibold min-w-[100px]">Annual Income</th>
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
                      <td className="px-3 py-3 text-gray-700">{p.ownerName} ({p.ownerRelation})</td>
                      <td className="px-3 py-3 text-gray-700">{formatCurrency(p.annualIncome)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Declaration */}
        <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-blue-700 tracking-wide mb-4">DECLARATION</h2>
          {declaration ? (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1.2fr] gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{declaration.declarationText}</p>
              </div>
              <SummaryField label="Date" value={formatDate(declaration.declarationDate)} />
              <SummaryField label="Place" value={declaration.place} />
              <SummaryField label="Signature" value={declaration.employeeSignature} italic />
            </div>
          ) : (
            <p className="text-sm text-gray-400">No declaration submitted yet.</p>
          )}
        </div>

        {/* Action bar */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('/admin/returns')} icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }>
            Back to All Returns
          </Button>

          {iprReturn.status === 'SUBMITTED' && (
            <Button variant="success" onClick={() => setApproveConfirmOpen(true)} icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              Approve Return
            </Button>
          )}

          {iprReturn.status === 'APPROVED' && (
            <span className="text-sm text-green-700 font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approved on {formatDateTime(iprReturn.approvedAt)}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 pb-6">
          Looking for this employee's other filings?{' '}
          <Link to={`/admin/returns?employee=${iprReturn.employeeId}`} className="text-blue-600 hover:underline">
            View all returns
          </Link>
        </p>
      </div>

      <ConfirmDialog
        open={approveConfirmOpen}
        title="Approve this IPR Return?"
        message={`This will mark ${iprReturn.employeeName}'s ${iprReturn.reportingYear} return as approved. This action cannot be undone.`}
        confirmLabel="Approve"
        variant="success"
        isLoading={isApproving}
        onConfirm={handleApprove}
        onCancel={() => setApproveConfirmOpen(false)}
      />
    </AppLayout>
  );
}

function SummaryField({ label, value, italic = false }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm text-gray-800 ${italic ? 'italic font-serif' : 'font-medium'}`}>{value}</p>
    </div>
  );
}
