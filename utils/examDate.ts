import type { Exam } from '../types';

/** Firestore liefert `date` als ISO-String oder Timestamp-ähnliches Objekt. */
export function examDateValue(exam: Exam): Date {
  const raw = exam.date as unknown;
  if (raw && typeof raw === 'object' && raw !== null && typeof (raw as { toDate?: () => Date }).toDate === 'function') {
    return (raw as { toDate: () => Date }).toDate();
  }
  if (raw && typeof raw === 'object' && raw !== null && 'seconds' in raw) {
    const s = (raw as { seconds: number }).seconds;
    if (typeof s === 'number') return new Date(s * 1000);
  }
  const d = new Date(exam.date as string);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}
