// utils/datetime.ts
export function localDateTimeToUTC(input: string): string | null {
  if (!input) return null;
  const [datePart, timePart] = input.split('T');
  if (!datePart || !timePart) return null;

  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  if ([y, m, d, hh, mm].some(isNaN)) return null;

  const local = new Date(y, m - 1, d, hh, mm);
  if (isNaN(local.getTime())) return null;

  // ISO UTC (sans millisecondes)
  return local.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function formatDateToInputValue(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
