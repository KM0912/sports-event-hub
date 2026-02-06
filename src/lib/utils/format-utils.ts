export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function calculateRemainingSlots(
  capacity: number,
  approvedCount: number
): number {
  return Math.max(0, capacity - approvedCount);
}

export function formatRemainingSlots(
  capacity: number,
  approvedCount: number
): string {
  const remaining = calculateRemainingSlots(capacity, approvedCount);
  return `残り${remaining}枠 / 定員${capacity}名`;
}
