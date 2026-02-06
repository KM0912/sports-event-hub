import type { ApplicationStatus } from '@/types/application';

export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  pending: { label: '保留中', color: 'yellow' },
  approved: { label: '承認済み', color: 'green' },
  rejected: { label: '拒否', color: 'red' },
  cancelled: { label: 'キャンセル済み', color: 'gray' },
} as const;
