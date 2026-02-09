import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ShuttlecockIcon } from '@/components/layout/shuttlecock-icon';
import { NavLinks } from '@/components/layout/nav-links';

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
        <nav className="flex items-center gap-0.5 sm:gap-2 [&_a]:active:scale-95 [&_a]:transition-transform">
          {user ? (
            <NavLinks
              pendingCount={pendingCount}
              unreadChatCount={unreadChatCount}
            />
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
