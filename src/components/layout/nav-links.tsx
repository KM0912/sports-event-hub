'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarPlus, LayoutDashboard, LogOut, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/actions/auth-actions';

interface NavLinksProps {
  pendingCount: number;
  unreadChatCount: number;
}

export function NavLinks({ pendingCount, unreadChatCount }: NavLinksProps) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      <Link href={ROUTES.EVENTS_NEW}>
        <Button
          variant="ghost"
          size="sm"
          className={`min-h-10 min-w-10 gap-1.5 sm:min-h-0 sm:min-w-0 ${isActive('/events/new') ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">練習会を作成</span>
        </Button>
      </Link>
      <Link href={ROUTES.DASHBOARD}>
        <Button
          variant="ghost"
          size="sm"
          className={`relative min-h-10 min-w-10 gap-1.5 sm:min-h-0 sm:min-w-0 ${isActive('/dashboard') ? 'bg-accent text-accent-foreground' : ''}`}
        >
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
        <Button
          variant="ghost"
          size="sm"
          className={`relative min-h-10 min-w-10 gap-1.5 sm:min-h-0 sm:min-w-0 ${isActive('/my-page') ? 'bg-accent text-accent-foreground' : ''}`}
        >
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
          className="min-h-10 min-w-10 gap-1.5 text-muted-foreground hover:text-foreground sm:min-h-0 sm:min-w-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">ログアウト</span>
        </Button>
      </form>
    </>
  );
}
