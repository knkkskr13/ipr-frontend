import type { IprStatus } from '@/types/common';

const STATUS_STYLES: Record<IprStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
  SUBMITTED: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  APPROVED: 'bg-green-50 text-green-700 border-green-300',
  RETURNED: 'bg-red-50 text-red-700 border-red-300',
};

const STATUS_LABELS: Record<IprStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
};

export function StatusBadge({ status }: { status: IprStatus }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
