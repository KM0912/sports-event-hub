import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateRemainingSlots,
  formatRemainingSlots,
} from '@/lib/utils/format-utils';

describe('formatCurrency', () => {
  it('円記号付きで金額をフォーマットする', () => {
    expect(formatCurrency(500)).toBe('¥500');
  });

  it('千の位にカンマを付ける', () => {
    expect(formatCurrency(1000)).toBe('¥1,000');
  });

  it('0円をフォーマットする', () => {
    expect(formatCurrency(0)).toBe('¥0');
  });

  it('大きな金額をフォーマットする', () => {
    expect(formatCurrency(10000)).toBe('¥10,000');
  });
});

describe('calculateRemainingSlots', () => {
  it('残り枠を計算する', () => {
    expect(calculateRemainingSlots(10, 3)).toBe(7);
  });

  it('定員に達している場合は0', () => {
    expect(calculateRemainingSlots(10, 10)).toBe(0);
  });

  it('承認数が定員を超えている場合も0', () => {
    expect(calculateRemainingSlots(10, 11)).toBe(0);
  });

  it('誰も承認されていない場合は定員数', () => {
    expect(calculateRemainingSlots(10, 0)).toBe(10);
  });
});

describe('formatRemainingSlots', () => {
  it('残り枠と定員を表示する', () => {
    expect(formatRemainingSlots(10, 3)).toBe('残り7枠 / 定員10名');
  });

  it('満員の場合は残り0枠と表示する', () => {
    expect(formatRemainingSlots(10, 10)).toBe('残り0枠 / 定員10名');
  });
});
