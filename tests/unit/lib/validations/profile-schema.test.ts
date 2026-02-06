import { describe, it, expect } from 'vitest';
import { profileSchema } from '@/lib/validations/profile-schema';

describe('profileSchema', () => {
  it('有効な表示名を受け入れる', () => {
    const result = profileSchema.safeParse({ displayName: 'テストユーザー' });
    expect(result.success).toBe(true);
  });

  it('2文字の表示名を受け入れる', () => {
    const result = profileSchema.safeParse({ displayName: 'AB' });
    expect(result.success).toBe(true);
  });

  it('20文字の表示名を受け入れる', () => {
    const result = profileSchema.safeParse({ displayName: 'a'.repeat(20) });
    expect(result.success).toBe(true);
  });

  it('1文字の表示名を拒否する', () => {
    const result = profileSchema.safeParse({ displayName: 'A' });
    expect(result.success).toBe(false);
  });

  it('21文字の表示名を拒否する', () => {
    const result = profileSchema.safeParse({ displayName: 'a'.repeat(21) });
    expect(result.success).toBe(false);
  });

  it('空文字を拒否する', () => {
    const result = profileSchema.safeParse({ displayName: '' });
    expect(result.success).toBe(false);
  });
});
