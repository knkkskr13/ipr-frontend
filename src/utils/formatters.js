/**
 * Format a number as Indian Rupee with comma separation.
 * e.g. 100000 → 1,00,000
 */
export function formatINR(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  return num.toLocaleString('en-IN');
}

/**
 * Convert backend date array [year, month, day] or ISO string to DD/MM/YYYY.
 */
export function formatDate(value) {
  if (!value) return '—';
  try {
    if (Array.isArray(value)) {
      const [y, m, d] = value;
      return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return String(value);
  }
}

/**
 * Convert backend date array [year, month, day] or ISO string to YYYY-MM-DD (for input[type=date]).
 */
export function toInputDate(value) {
  if (!value) return '';
  try {
    if (Array.isArray(value)) {
      const [y, m, d] = value;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Get today's date as YYYY-MM-DD.
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}
