'use server';

import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validations/profile-schema';
import type { ActionResult } from '@/types/action-result';
import type { Profile } from '@/types/profile';
import { getAuthUser } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function getProfile(): Promise<ActionResult<Profile | null>> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return {
      success: false,
      error: 'プロフィールの取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: true,
    data: data
      ? {
          id: data.id,
          displayName: data.display_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null,
  };
}

export async function createProfile(
  displayName: string
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const parsed = profileSchema.safeParse({ displayName });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    display_name: parsed.data.displayName,
  });

  if (error) {
    return {
      success: false,
      error: 'プロフィールの作成に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/');
  return { success: true, data: undefined };
}

export async function updateProfile(
  displayName: string
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const parsed = profileSchema.safeParse({ displayName });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: parsed.data.displayName })
    .eq('id', user.id);

  if (error) {
    return {
      success: false,
      error: 'プロフィールの更新に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/');
  return { success: true, data: undefined };
}
