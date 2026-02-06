import Link from 'next/link';
import {
  CalendarPlus,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/actions/auth-actions';
import { ShuttlecockIcon } from '@/components/layout/shuttlecock-icon';

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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShuttlecockIcon className="h-5 w-5" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            バドミントン練習会 宮城
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <Link href={ROUTES.EVENTS_NEW}>
                <Button
                  size="sm"
                  className="gap-1.5 bg-primary font-semibold shadow-sm hover:bg-primary/90"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">練習会を作成</span>
                </Button>
              </Link>
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="ghost" size="sm" className="relative gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">ダッシュボード</span>
                  {pendingCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-[10px] font-bold"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href={ROUTES.MY_PAGE}>
                <Button variant="ghost" size="sm" className="relative gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">マイページ</span>
                  {unreadChatCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-[10px] font-bold"
                    >
                      {unreadChatCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <form action={signOut}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">ログアウト</span>
                </Button>
              </form>
            </>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button size="sm" className="gap-1.5 font-semibold shadow-sm">
                <LogIn className="h-4 w-4" />
                ログイン
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
