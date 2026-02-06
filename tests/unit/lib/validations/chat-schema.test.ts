import { describe, it, expect } from 'vitest';
import { chatMessageSchema } from '@/lib/validations/chat-schema';

describe('chatMessageSchema', () => {
  const validData = {
    eventId: '550e8400-e29b-41d4-a716-446655440000',
    receiverId: '660e8400-e29b-41d4-a716-446655440000',
    content: 'テストメッセージ',
  };

  it('有効なデータを受け入れる', () => {
    const result = chatMessageSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('空のコンテンツを拒否する', () => {
    const result = chatMessageSchema.safeParse({ ...validData, content: '' });
    expect(result.success).toBe(false);
  });

  it('500文字を超えるコンテンツを拒否する', () => {
    const result = chatMessageSchema.safeParse({
      ...validData,
      content: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('500文字のコンテンツを受け入れる', () => {
    const result = chatMessageSchema.safeParse({
      ...validData,
      content: 'a'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('無効なeventIdを拒否する', () => {
    const result = chatMessageSchema.safeParse({
      ...validData,
      eventId: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('無効なreceiverIdを拒否する', () => {
    const result = chatMessageSchema.safeParse({
      ...validData,
      receiverId: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
