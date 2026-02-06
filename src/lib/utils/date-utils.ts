import {
  format,
  subHours,
  addHours,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';

export function formatEventDate(
  startDatetime: string,
  endDatetime: string
): string {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const dateStr = format(start, 'M/d(E)', { locale: ja });
  const startTime = format(start, 'HH:mm');
  const endTime = format(end, 'HH:mm');
  return `${dateStr} ${startTime}〜${endTime}`;
}

export function formatDate(date: string): string {
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: ja });
}

export function isPastDeadline(
  startDatetime: string,
  deadlineHoursBefore: number | null
): boolean {
  if (deadlineHoursBefore === null) return false;
  const deadline = subHours(new Date(startDatetime), deadlineHoursBefore);
  return isAfter(new Date(), deadline);
}

export function isEventStarted(startDatetime: string): boolean {
  return isAfter(new Date(), new Date(startDatetime));
}

export function isChatExpired(endDatetime: string): boolean {
  const expiry = addHours(new Date(endDatetime), 48);
  return isAfter(new Date(), expiry);
}

export type DateRangeKey =
  | 'today'
  | 'this_week'
  | 'next_week'
  | 'this_month'
  | 'next_month';

export function getDateRange(key: DateRangeKey): { from: Date; to: Date } {
  const now = new Date();
  switch (key) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'this_week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'next_week': {
      const nextWeekStart = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
      return {
        from: nextWeekStart,
        to: endOfWeek(nextWeekStart, { weekStartsOn: 1 }),
      };
    }
    case 'this_month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'next_month': {
      const nextMonthStart = addMonths(startOfMonth(now), 1);
      return { from: nextMonthStart, to: endOfMonth(nextMonthStart) };
    }
  }
}

export function isBeforeNow(date: string): boolean {
  return isBefore(new Date(date), new Date());
}
