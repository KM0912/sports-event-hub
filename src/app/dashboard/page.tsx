import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarPlus,
  Calendar,
  MapPin,
  Users,
  Clock,
  ClipboardList,
  Pencil,
  CalendarX,
} from 'lucide-react';
import { getAuthUser } from '@/actions/auth-actions';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { formatEventDate } from '@/lib/utils/date-utils';
import { formatRemainingSlots } from '@/lib/utils/format-utils';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.LOGIN);

  const supabase = await createClient();

  // 自分が主催するイベント取得
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('start_datetime', { ascending: false });

  // 各イベントの申請数を取得
  const eventIds = (events || []).map((e) => e.id);
  const { data: applications } = await supabase
    .from('applications')
    .select('event_id, status')
    .in('event_id', eventIds.length > 0 ? eventIds : ['__none__']);

  const countMap: Record<string, { pending: number; approved: number }> = {};
  (applications || []).forEach((a) => {
    if (!countMap[a.event_id]) {
      countMap[a.event_id] = { pending: 0, approved: 0 };
    }
    if (a.status === 'pending') countMap[a.event_id].pending++;
    if (a.status === 'approved') countMap[a.event_id].approved++;
  });

  const totalPending = Object.values(countMap).reduce(
    (sum, c) => sum + c.pending,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-lg font-bold sm:text-2xl">
            <div className="h-7 w-1 shrink-0 rounded-full bg-primary" />
            ダッシュボード
          </h1>
          {totalPending > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-600">
              <Clock className="h-3.5 w-3.5" />
              {totalPending}件の保留中申請があります
            </p>
          )}
        </div>
        <Button asChild className="gap-1.5 font-semibold shadow-sm">
          <Link href={ROUTES.EVENTS_NEW}>
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">練習会を作成</span>
          </Link>
        </Button>
      </div>

      {/* 空状態 */}
      {(!events || events.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CalendarX className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-base font-medium text-muted-foreground">
            主催する練習会はまだありません
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            最初の練習会を作成してみましょう
          </p>
          <Button asChild className="mt-6 gap-1.5 font-semibold">
            <Link href={ROUTES.EVENTS_NEW}>
              <CalendarPlus className="h-4 w-4" />
              練習会を作成
            </Link>
          </Button>
        </div>
      )}

      {/* イベントリスト */}
      <div className="space-y-4">
        {(events || []).map((event) => {
          const counts = countMap[event.id] || { pending: 0, approved: 0 };
          const isCancelled = event.status === 'cancelled';

          return (
            <Card
              key={event.id}
              className={`border-border/60 py-0 shadow-sm transition-shadow hover:shadow-md ${isCancelled ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="truncate text-base font-bold">
                          {event.title}
                        </h3>
                        <Badge
                          variant={
                            event.status === 'published'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={`shrink-0 text-[10px] ${
                            event.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ''
                          }`}
                        >
                          {event.status === 'published'
                            ? '公開中'
                            : 'キャンセル'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatEventDate(
                            event.start_datetime,
                            event.end_datetime
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.venue_name}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {formatRemainingSlots(
                            event.capacity,
                            counts.approved
                          )}
                        </span>
                        {counts.pending > 0 && (
                          <span className="flex items-center gap-1 font-medium text-amber-600">
                            <Clock className="h-3.5 w-3.5" />
                            保留中 {counts.pending}件
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden shrink-0 gap-2 sm:flex">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-1 border-border/60"
                      >
                        <Link href={ROUTES.APPLICATIONS(event.id)}>
                          <ClipboardList className="h-3.5 w-3.5" />
                          申請管理
                        </Link>
                      </Button>
                      {!isCancelled && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-1 border-border/60"
                        >
                          <Link href={ROUTES.EVENT_EDIT(event.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                            編集
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* モバイル用アクションボタン */}
                  <div className="flex gap-2 sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-9 flex-1 gap-1 border-border/60"
                    >
                      <Link href={ROUTES.APPLICATIONS(event.id)}>
                        <ClipboardList className="h-3.5 w-3.5" />
                        申請管理
                      </Link>
                    </Button>
                    {!isCancelled && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9 flex-1 gap-1 border-border/60"
                      >
                        <Link href={ROUTES.EVENT_EDIT(event.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                          編集
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
