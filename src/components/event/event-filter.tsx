'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MUNICIPALITIES } from '@/constants/municipalities';
import { EVENT_LEVEL_OPTIONS } from '@/constants/levels';

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'next_week', label: '来週' },
  { value: 'this_month', label: '今月' },
  { value: 'next_month', label: '来月' },
];

export function EventFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/');
  }

  const hasFilters =
    searchParams.has('dateRange') ||
    searchParams.has('municipality') ||
    searchParams.has('level');

  return (
    <div className="space-y-2 sm:space-y-0">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        絞り込み
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={searchParams.get('dateRange') || ''}
          onValueChange={(v) => updateFilter('dateRange', v || undefined)}
        >
          <SelectTrigger className="h-10 min-w-0 flex-1 border-border/60 bg-card text-sm shadow-sm sm:h-9 sm:w-[130px] sm:flex-none">
            <SelectValue placeholder="日付" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('municipality') || ''}
          onValueChange={(v) => updateFilter('municipality', v || undefined)}
        >
          <SelectTrigger className="h-10 min-w-0 flex-1 border-border/60 bg-card text-sm shadow-sm sm:h-9 sm:w-[150px] sm:flex-none">
            <SelectValue placeholder="市区町村" />
          </SelectTrigger>
          <SelectContent>
            {MUNICIPALITIES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('level') || ''}
          onValueChange={(v) => updateFilter('level', v || undefined)}
        >
          <SelectTrigger className="h-10 min-w-0 flex-1 border-border/60 bg-card text-sm shadow-sm sm:h-9 sm:w-[150px] sm:flex-none">
            <SelectValue placeholder="レベル" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 gap-1 text-muted-foreground hover:text-destructive sm:h-9"
          >
            <X className="h-3.5 w-3.5" />
            クリア
          </Button>
        )}
      </div>
    </div>
  );
}
