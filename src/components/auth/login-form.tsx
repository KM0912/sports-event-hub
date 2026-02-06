'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signUp, signIn, signInWithGoogle } from '@/actions/auth-actions';
import { ROUTES } from '@/constants/routes';

export function LoginForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (isSignUp) {
      setMessage(
        '確認メールを送信しました。メールのリンクをクリックしてください。'
      );
    } else {
      router.push(ROUTES.HOME);
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    const result = await signInWithGoogle();
    if (result.success) {
      window.location.href = result.data.url;
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* ブランドヘッダー */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-lg shadow-primary/20">
          B
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Badminton Event Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          宮城県のバドミントン練習会プラットフォーム
        </p>
      </div>

      <Card className="border-border/60 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? '新しいアカウントを作成して練習会に参加しよう'
              : 'アカウントにログインして練習会を探そう'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full gap-2 border-border/60 font-medium shadow-sm"
            onClick={handleGoogleSignIn}
            type="button"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">または</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : isSignUp ? (
                'アカウント作成'
              ) : (
                'ログイン'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <p>
                アカウントをお持ちの方は{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    setMessage('');
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  ログイン
                </button>
              </p>
            ) : (
              <p>
                アカウントをお持ちでない方は{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                    setMessage('');
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  アカウント作成
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
