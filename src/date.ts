import * as dateFormat from 'dateformat';

const unitToFactor = new Map<string, number>([
  ['h', 60 * 60 * 1000],
  ['d', 24 * 60 * 60 * 1000],
]);

const truncateToDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// This function assumes that the time unit is either 'h' (hours) or 'd' (days)
// since, in my history, the minimum duration is '0 h' and the maximum is '920 d'
export const relativeToAbsoluteDate = (relativeDate: string): Date | null => {
  const [amountString, unit] = relativeDate.split(' ');
  if (!unitToFactor.has(unit)) return null;

  const amount = parseInt(amountString);
  const deltaInMs = amount * unitToFactor.get(unit);
  const subtracted = new Date(new Date().valueOf() - deltaInMs);

  return truncateToDate(subtracted);
};

export const formatDate = (date: Date): string => {
  return dateFormat(date, 'isoDate');
};