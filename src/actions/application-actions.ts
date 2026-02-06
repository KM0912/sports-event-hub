'use server';

import { createClient } from '@/lib/supabase/server';
import { applicationCreateSchema } from '@/lib/validations/application-schema';
import type { ActionResult } from '@/types/action-result';
import type {
  ApplicationWithApplicant,
  ApplicationWithEvent,
} from '@/types/application';
import { getAuthUser } from './auth-actions';
import { revalidatePath } from 'next/cache';
import { isPastDeadline } from '@/lib/utils/date-utils';
import { sendNotification } from '@/lib/notifications';

export async function applyToEvent(
  eventId: string,
  comment?: string
): Promise<ActionResult<{ applicationId: string }>> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const parsed = applicationCreateSchema.safeParse({ eventId, comment });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createClient();

  // イベント取得
  const { data: event } = await supabase
    .from('events')
    .select(
      'id, organizer_id, status, start_datetime, capacity, deadline_hours_before'
    )
    .eq('id', eventId)
    .single();

  if (!event) {
    return {
      success: false,
      error: 'イベントが見つかりません',
      code: 'NOT_FOUND',
    };
  }

  // 自分のイベントには申請不可
  if (event.organizer_id === user.id) {
    return {
      success: false,
      error: '自分のイベントには申請できません',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  // 公開中のイベントのみ
  if (event.status !== 'published') {
    return {
      success: false,
      error: 'このイベントには申請できません',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  // 募集締切チェック
  if (isPastDeadline(event.start_datetime, event.deadline_hours_before)) {
    return {
      success: false,
      error: '募集は締め切られました',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  // ブロックチェック
  const { data: block } = await supabase
    .from('blocks')
    .select('id')
    .eq('organizer_id', event.organizer_id)
    .eq('blocked_user_id', user.id)
    .single();

  if (block) {
    return {
      success: false,
      error: 'この練習会には申請できません',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  // 残り枠チェック
  const { count: approvedCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'approved');

  if ((approvedCount || 0) >= event.capacity) {
    return { success: false, error: '定員に達しています', code: 'CONFLICT' };
  }

  // 申請作成
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      event_id: eventId,
      applicant_id: user.id,
      comment: comment || null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        error: 'すでに申請済みです',
        code: 'CONFLICT',
      };
    }
    return {
      success: false,
      error: '申請に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  // 通知送信（非同期、失敗しても申請は成功扱い）
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();
  const { data: organizerProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', event.organizer_id)
    .single();

  sendNotification({
    type: 'application_received',
    data: {
      organizerId: event.organizer_id,
      organizerName: organizerProfile?.display_name || '',
      applicantName: profile?.display_name || '',
      eventTitle: '',
      eventId,
    },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath('/my-page');
  return { success: true, data: { applicationId: application.id } };
}

export async function cancelApplication(id: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { data: application } = await supabase
    .from('applications')
    .select('id, applicant_id, event_id, status')
    .eq('id', id)
    .single();

  if (!application) {
    return { success: false, error: '申請が見つかりません', code: 'NOT_FOUND' };
  }

  if (application.applicant_id !== user.id) {
    return {
      success: false,
      error: 'この操作を行う権限がありません',
      code: 'PERMISSION_ERROR',
    };
  }

  if (application.status !== 'pending' && application.status !== 'approved') {
    return {
      success: false,
      error: 'この申請はキャンセルできません',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    return {
      success: false,
      error: 'キャンセルに失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath(`/events/${application.event_id}`);
  revalidatePath('/my-page');
  return { success: true, data: undefined };
}

export async function approveApplication(id: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { data: application } = await supabase
    .from('applications')
    .select(
      'id, event_id, status, event:events!event_id(organizer_id, capacity)'
    )
    .eq('id', id)
    .single();

  if (!application) {
    return { success: false, error: '申請が見つかりません', code: 'NOT_FOUND' };
  }

  const event = application.event as unknown as {
    organizer_id: string;
    capacity: number;
  };
  if (event.organizer_id !== user.id) {
    return {
      success: false,
      error: 'この操作を行う権限がありません',
      code: 'PERMISSION_ERROR',
    };
  }

  if (application.status !== 'pending') {
    return {
      success: false,
      error: '保留中の申請のみ承認できます',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  // 定員チェック
  const { count: approvedCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', application.event_id)
    .eq('status', 'approved');

  if ((approvedCount || 0) >= event.capacity) {
    return { success: false, error: '定員に達しています', code: 'CONFLICT' };
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) {
    return {
      success: false,
      error: '承認に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  // 承認通知を送信
  const { data: appForNotify } = await supabase
    .from('applications')
    .select('applicant_id')
    .eq('id', id)
    .single();
  if (appForNotify) {
    const { data: applicantProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', appForNotify.applicant_id)
      .single();
    sendNotification({
      type: 'application_approved',
      data: {
        applicantId: appForNotify.applicant_id,
        applicantName: applicantProfile?.display_name || '',
        eventTitle: '',
        eventId: application.event_id,
      },
    });
  }

  revalidatePath(`/dashboard/events/${application.event_id}/applications`);
  return { success: true, data: undefined };
}

export async function rejectApplication(
  applicationId: string,
  block: boolean = false
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
  const { data: application } = await supabase
    .from('applications')
    .select(
      'id, applicant_id, event_id, status, event:events!event_id(organizer_id)'
    )
    .eq('id', applicationId)
    .single();

  if (!application) {
    return { success: false, error: '申請が見つかりません', code: 'NOT_FOUND' };
  }

  const event = application.event as unknown as { organizer_id: string };
  if (event.organizer_id !== user.id) {
    return {
      success: false,
      error: 'この操作を行う権限がありません',
      code: 'PERMISSION_ERROR',
    };
  }

  if (application.status !== 'pending') {
    return {
      success: false,
      error: '保留中の申請のみ拒否できます',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId);

  if (error) {
    return {
      success: false,
      error: '拒否に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  if (block) {
    await supabase.from('blocks').insert({
      organizer_id: user.id,
      blocked_user_id: application.applicant_id,
    });
  }

  // 拒否通知を送信
  const { data: applicantProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', application.applicant_id)
    .single();
  sendNotification({
    type: 'application_rejected',
    data: {
      applicantId: application.applicant_id,
      applicantName: applicantProfile?.display_name || '',
      eventTitle: '',
    },
  });

  revalidatePath(`/dashboard/events/${application.event_id}/applications`);
  return { success: true, data: undefined };
}

export async function getApplicationsByEvent(
  eventId: string
): Promise<ActionResult<ApplicationWithApplicant[]>> {
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
    .from('applications')
    .select('*, applicant:profiles!applicant_id(id, display_name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      success: false,
      error: '申請の取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: true,
    data: (data || []).map((a) => ({
      id: a.id,
      eventId: a.event_id,
      applicantId: a.applicant_id,
      comment: a.comment,
      status: a.status,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
      applicant: {
        id: (a.applicant as unknown as { id: string }).id,
        displayName: (a.applicant as unknown as { display_name: string })
          .display_name,
      },
    })),
  };
}

export async function getMyApplications(): Promise<
  ActionResult<ApplicationWithEvent[]>
> {
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
    .from('applications')
    .select(
      '*, event:events!event_id(id, title, start_datetime, end_datetime, venue_name, status, organizer_id, organizer:profiles!organizer_id(id, display_name))'
    )
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      success: false,
      error: '申請の取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: true,
    data: (data || []).map((a) => {
      const evt = a.event as unknown as {
        id: string;
        title: string;
        start_datetime: string;
        end_datetime: string;
        venue_name: string;
        status: string;
        organizer_id: string;
        organizer: { id: string; display_name: string };
      };
      return {
        id: a.id,
        eventId: a.event_id,
        applicantId: a.applicant_id,
        comment: a.comment,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        event: {
          id: evt.id,
          title: evt.title,
          startDatetime: evt.start_datetime,
          endDatetime: evt.end_datetime,
          venueName: evt.venue_name,
          status: evt.status,
          organizerId: evt.organizer_id,
          organizer: {
            id: evt.organizer.id,
            displayName: evt.organizer.display_name,
          },
        },
      };
    }),
  };
}
