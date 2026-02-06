import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/actions/auth-actions';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pendingCount = 0;
  let unreadChatCount = 0;

  if (user) {
    // 自分のイベントへの保留中申請数
    const { data: myEvents } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', user.id);

    if (myEvents && myEvents.length > 0) {
      const eventIds = myEvents.map((e) => e.id);
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .eq('status', 'pending');
      pendingCount = count || 0;
    }

    // 未読チャット数
    const { count: unread } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    unreadChatCount = unread || 0;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="text-xl font-bold">
          Badminton Event Hub
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href={ROUTES.EVENTS_NEW}>
                <Button variant="outline" size="sm">
                  練習会を作成
                </Button>
              </Link>
              <Link href={ROUTES.DASHBOARD} className="relative">
                <Button variant="ghost" size="sm">
                  ダッシュボード
                  {pendingCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-5 min-w-5 px-1 text-xs"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href={ROUTES.MY_PAGE} className="relative">
                <Button variant="ghost" size="sm">
                  マイページ
                  {unreadChatCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-5 min-w-5 px-1 text-xs"
                    >
                      {unreadChatCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit">
                  ログアウト
                </Button>
              </form>
            </>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button size="sm">ログイン</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
