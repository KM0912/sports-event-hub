'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignUp ? 'アカウント作成' : 'ログイン'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? '新しいアカウントを作成します'
            : 'メールアドレスでログインします'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          type="button"
        >
          Googleでログイン
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              または
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
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

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
          </Button>
        </form>

        <div className="text-center text-sm">
          {isSignUp ? (
            <p>
              アカウントをお持ちの方は
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                  setMessage('');
                }}
                className="text-primary underline"
              >
                ログイン
              </button>
            </p>
          ) : (
            <p>
              アカウントをお持ちでない方は
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                  setMessage('');
                }}
                className="text-primary underline"
              >
                アカウント作成
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
