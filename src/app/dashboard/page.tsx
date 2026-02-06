import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/actions/auth-actions';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href={ROUTES.EVENTS_NEW}>練習会を作成</Link>
        </Button>
      </div>

      {(!events || events.length === 0) && (
        <p className="text-center text-muted-foreground">
          主催する練習会はまだありません
        </p>
      )}

      <div className="space-y-4">
        {(events || []).map((event) => {
          const counts = countMap[event.id] || { pending: 0, approved: 0 };
          return (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatEventDate(
                        event.start_datetime,
                        event.end_datetime
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={
                      event.status === 'published'
                        ? 'default'
                        : event.status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {event.status === 'published'
                      ? '公開中'
                      : event.status === 'draft'
                        ? '下書き'
                        : 'キャンセル'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm">
                    <span>
                      {formatRemainingSlots(event.capacity, counts.approved)}
                    </span>
                    {counts.pending > 0 && (
                      <span className="text-yellow-600">
                        保留中: {counts.pending}件
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.APPLICATIONS(event.id)}>申請管理</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.EVENT_EDIT(event.id)}>編集</Link>
                    </Button>
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
