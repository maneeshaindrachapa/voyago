import { ISOStringFormat } from 'date-fns';

export function formatDate(isoString: ISOStringFormat) {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}
