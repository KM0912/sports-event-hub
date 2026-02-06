import type { EventLevel } from '@/types/event';

export const EVENT_LEVELS: Record<
  EventLevel,
  { label: string; color: string }
> = {
  beginner: { label: '初心者', color: 'green' },
  elementary: { label: '初級', color: 'blue' },
  intermediate: { label: '中級', color: 'yellow' },
  advanced: { label: '上級', color: 'red' },
  all: { label: 'すべてのレベル', color: 'gray' },
} as const;

export const EVENT_LEVEL_OPTIONS = Object.entries(EVENT_LEVELS).map(
  ([value, { label }]) => ({
    value: value as EventLevel,
    label,
  })
);
