import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                B
              </span>
              <span className="font-bold tracking-tight">
                Badminton Event Hub
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
              <li>
                <Link
                  href={ROUTES.LOGIN}
                  className="transition-colors hover:text-foreground"
                >
                  ログイン
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">サポート</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/70">
                  お問い合わせ（準備中）
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/70">
                  利用規約（準備中）
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; 2026 Badminton Event Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
