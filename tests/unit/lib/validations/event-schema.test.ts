import { describe, it, expect } from 'vitest';
import {
  eventCreateSchema,
  eventFilterSchema,
} from '@/lib/validations/event-schema';

describe('eventCreateSchema', () => {
  const validData = {
    title: '練習会テスト',
    startDatetime: new Date('2026-03-01T10:00:00'),
    endDatetime: new Date('2026-03-01T12:00:00'),
    venueName: 'テスト体育館',
    venueAddress: '宮城県仙台市青葉区1-1',
    municipality: '仙台市青葉区',
    level: 'intermediate' as const,
    capacity: 10,
    fee: 500,
  };

  it('有効なデータを受け入れる', () => {
    const result = eventCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('タイトルが空の場合エラー', () => {
    const result = eventCreateSchema.safeParse({ ...validData, title: '' });
    expect(result.success).toBe(false);
  });

  it('タイトルが100文字を超える場合エラー', () => {
    const result = eventCreateSchema.safeParse({
      ...validData,
      title: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('終了日時が開始日時より前の場合エラー', () => {
    const result = eventCreateSchema.safeParse({
      ...validData,
      endDatetime: new Date('2026-03-01T09:00:00'),
    });
    expect(result.success).toBe(false);
  });

  it('定員が0の場合エラー', () => {
    const result = eventCreateSchema.safeParse({ ...validData, capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('参加費が負の場合エラー', () => {
    const result = eventCreateSchema.safeParse({ ...validData, fee: -1 });
    expect(result.success).toBe(false);
  });

  it('参加費が0の場合は受け入れる', () => {
    const result = eventCreateSchema.safeParse({ ...validData, fee: 0 });
    expect(result.success).toBe(true);
  });

  it('オプションフィールドは省略可能', () => {
    const result = eventCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('オプションフィールドが空文字でも受け入れる', () => {
    const result = eventCreateSchema.safeParse({
      ...validData,
      description: '',
      rules: '',
    });
    expect(result.success).toBe(true);
  });

  it('募集締切が1時間未満の場合エラー', () => {
    const result = eventCreateSchema.safeParse({
      ...validData,
      deadlineHoursBefore: 0,
    });
    expect(result.success).toBe(false);
  });

  it('募集締切が72時間を超える場合エラー', () => {
    const result = eventCreateSchema.safeParse({
      ...validData,
      deadlineHoursBefore: 73,
    });
    expect(result.success).toBe(false);
  });
});

describe('eventFilterSchema', () => {
  it('空オブジェクトを受け入れる（デフォルト値を使用）', () => {
    const result = eventFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.perPage).toBe(20);
    }
  });

  it('有効なフィルターを受け入れる', () => {
    const result = eventFilterSchema.safeParse({
      dateRange: 'this_week',
      level: 'beginner',
      page: 2,
      perPage: 10,
    });
    expect(result.success).toBe(true);
  });

  it('無効なdateRangeを拒否する', () => {
    const result = eventFilterSchema.safeParse({ dateRange: 'invalid' });
    expect(result.success).toBe(false);
  });
});
