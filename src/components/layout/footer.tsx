import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';
import { ShuttlecockIcon } from '@/components/layout/shuttlecock-icon';

export async function Footer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShuttlecockIcon className="h-4 w-4" />
              </span>
              <span className="font-bold tracking-tight">
                バドミントン練習会 宮城
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              宮城県のバドミントン練習会を
              <br />
              見つけて、参加しよう。
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">メニュー</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={ROUTES.HOME}
                  className="transition-colors hover:text-foreground"
                >
                  練習会を探す
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.EVENTS_NEW}
                  className="transition-colors hover:text-foreground"
                >
                  練習会を作成
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="transition-colors hover:text-foreground"
                    >
                      ダッシュボード
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.MY_PAGE}
                      className="transition-colors hover:text-foreground"
                    >
                      マイページ
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href={ROUTES.LOGIN}
                    className="transition-colors hover:text-foreground"
                  >
                    ログイン
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; 2026 バドミントン練習会 宮城. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
