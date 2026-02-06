'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/action-result';
import type { Block } from '@/types/block';
import { getAuthUser } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function blockUser(blockedUserId: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  if (user.id === blockedUserId) {
    return {
      success: false,
      error: '自分自身をブロックすることはできません',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('blocks').insert({
    organizer_id: user.id,
    blocked_user_id: blockedUserId,
  });

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        error: 'すでにブロック済みです',
        code: 'CONFLICT',
      };
    }
    return {
      success: false,
      error: 'ブロックに失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/dashboard');
  return { success: true, data: undefined };
}

export async function unblockUser(
  blockedUserId: string
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('organizer_id', user.id)
    .eq('blocked_user_id', blockedUserId);

  if (error) {
    return {
      success: false,
      error: 'ブロック解除に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/dashboard');
  return { success: true, data: undefined };
}

export async function getBlockedUsers(): Promise<ActionResult<Block[]>> {
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
    .from('blocks')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      success: false,
      error: 'ブロックリストの取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: true,
    data: (data || []).map((b) => ({
      id: b.id,
      organizerId: b.organizer_id,
      blockedUserId: b.blocked_user_id,
      createdAt: b.created_at,
    })),
  };
}
