import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = checkIsPublicPath(pathname);

  // 未認証ユーザーが認証必須パスにアクセスした場合
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 認証済みユーザーのプロフィール未設定チェック
  if (user && !isPublicPath && pathname !== '/profile/setup') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/profile/setup';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

const PUBLIC_PATHS = ['/', '/login', '/events', '/auth/callback'];

export function checkIsPublicPath(pathname: string): boolean {
  // /events/ 配下でも認証が必要なパス
  const isAuthRequiredEventPath =
    pathname === '/events/new' || /^\/events\/[^/]+\/edit$/.test(pathname);

  return (
    (PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/events/')) &&
    !isAuthRequiredEventPath
  );
}
