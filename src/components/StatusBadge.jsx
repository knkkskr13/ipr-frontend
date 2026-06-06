const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-300',
  SUBMITTED: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 border border-green-300',
  RETURNED: 'bg-red-100 text-red-800 border border-red-300',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}
