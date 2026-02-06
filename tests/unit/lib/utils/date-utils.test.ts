import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatEventDate,
  formatDate,
  isPastDeadline,
  isEventStarted,
  isChatExpired,
  getDateRange,
  isBeforeNow,
} from '@/lib/utils/date-utils';

describe('formatEventDate', () => {
  it('日付と時間帯を正しくフォーマットする', () => {
    const result = formatEventDate(
      '2026-03-15T10:00:00+09:00',
      '2026-03-15T12:00:00+09:00'
    );
    expect(result).toContain('3/15');
    expect(result).toContain('10:00');
    expect(result).toContain('12:00');
  });
});

describe('formatDate', () => {
  it('日付をフォーマットする', () => {
    const result = formatDate('2026-01-15T10:30:00+09:00');
    expect(result).toContain('2026/01/15');
    expect(result).toContain('10:30');
  });
});

describe('isPastDeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deadlineHoursBeforeがnullの場合はfalse', () => {
    expect(isPastDeadline('2026-03-15T10:00:00Z', null)).toBe(false);
  });

  it('締切前はfalse', () => {
    vi.setSystemTime(new Date('2026-03-14T00:00:00Z'));
    expect(isPastDeadline('2026-03-15T10:00:00Z', 2)).toBe(false);
  });

  it('締切後はtrue', () => {
    vi.setSystemTime(new Date('2026-03-15T09:00:00Z'));
    expect(isPastDeadline('2026-03-15T10:00:00Z', 2)).toBe(true);
  });
});

describe('isEventStarted', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('開始前はfalse', () => {
    vi.setSystemTime(new Date('2026-03-14T00:00:00Z'));
    expect(isEventStarted('2026-03-15T10:00:00Z')).toBe(false);
  });

  it('開始後はtrue', () => {
    vi.setSystemTime(new Date('2026-03-15T11:00:00Z'));
    expect(isEventStarted('2026-03-15T10:00:00Z')).toBe(true);
  });
});

describe('isChatExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('イベント終了48時間以内はfalse', () => {
    vi.setSystemTime(new Date('2026-03-15T14:00:00Z'));
    expect(isChatExpired('2026-03-15T12:00:00Z')).toBe(false);
  });

  it('イベント終了48時間後はtrue', () => {
    vi.setSystemTime(new Date('2026-03-17T13:00:00Z'));
    expect(isChatExpired('2026-03-15T12:00:00Z')).toBe(true);
  });
});

describe('getDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-11T12:00:00Z')); // Wednesday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('todayは当日の開始と終了を返す', () => {
    const range = getDateRange('today');
    expect(range.from.getDate()).toBe(11);
    expect(range.to.getDate()).toBe(11);
  });

  it('this_weekは今週の範囲を返す', () => {
    const range = getDateRange('this_week');
    expect(range.from.getDay()).toBe(1); // Monday
  });

  it('this_monthは今月の範囲を返す', () => {
    const range = getDateRange('this_month');
    expect(range.from.getMonth()).toBe(2); // March
    expect(range.to.getMonth()).toBe(2);
  });
});

describe('isBeforeNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('過去の日付はtrue', () => {
    expect(isBeforeNow('2026-03-14T10:00:00Z')).toBe(true);
  });

  it('未来の日付はfalse', () => {
    expect(isBeforeNow('2026-03-16T10:00:00Z')).toBe(false);
  });
});
