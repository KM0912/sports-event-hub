import { describe, it, expect } from 'vitest';
import {
  applicationCreateSchema,
  applicationRejectSchema,
} from '@/lib/validations/application-schema';

describe('applicationCreateSchema', () => {
  it('有効なデータを受け入れる', () => {
    const result = applicationCreateSchema.safeParse({
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      comment: '参加します！',
    });
    expect(result.success).toBe(true);
  });

  it('コメントなしでも受け入れる', () => {
    const result = applicationCreateSchema.safeParse({
      eventId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('無効なUUIDを拒否する', () => {
    const result = applicationCreateSchema.safeParse({
      eventId: 'invalid-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('コメントが500文字を超える場合エラー', () => {
    const result = applicationCreateSchema.safeParse({
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      comment: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('applicationRejectSchema', () => {
  it('有効なデータを受け入れる', () => {
    const result = applicationRejectSchema.safeParse({
      applicationId: '550e8400-e29b-41d4-a716-446655440000',
      block: true,
    });
    expect(result.success).toBe(true);
  });

  it('blockのデフォルトはfalse', () => {
    const result = applicationRejectSchema.safeParse({
      applicationId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.block).toBe(false);
    }
  });
});
