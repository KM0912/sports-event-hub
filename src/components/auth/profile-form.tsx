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
import { createProfile, updateProfile } from '@/actions/profile-actions';
import { ROUTES } from '@/constants/routes';

interface ProfileFormProps {
  initialDisplayName?: string;
  isEdit?: boolean;
}

export function ProfileForm({
  initialDisplayName = '',
  isEdit = false,
}: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isEdit
      ? await updateProfile(displayName)
      : await createProfile(displayName);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(ROUTES.HOME);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'プロフィール編集' : 'プロフィール設定'}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? '表示名を変更できます'
            : 'サービスを利用するために表示名を設定してください'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="2〜20文字"
              minLength={2}
              maxLength={20}
              required
            />
            <p className="text-xs text-muted-foreground">
              2〜20文字で入力してください
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '保存中...' : isEdit ? '更新する' : '設定する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
