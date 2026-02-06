'use server';

import { createClient } from '@/lib/supabase/server';
import {
  eventCreateSchema,
  eventFilterSchema,
  type EventCreateInput,
  type EventFilterInput,
} from '@/lib/validations/event-schema';
import type { ActionResult } from '@/types/action-result';
import type { EventWithCounts } from '@/types/event';
import { getAuthUser } from './auth-actions';
import { revalidatePath } from 'next/cache';
import { getDateRange, type DateRangeKey } from '@/lib/utils/date-utils';

export async function createEvent(
  data: EventCreateInput
): Promise<ActionResult<{ eventId: string }>> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const parsed = eventCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      title: parsed.data.title,
      start_datetime: parsed.data.startDatetime.toISOString(),
      end_datetime: parsed.data.endDatetime.toISOString(),
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress,
      municipality: parsed.data.municipality,
      level: parsed.data.level,
      level_note: parsed.data.levelNote || null,
      capacity: parsed.data.capacity,
      fee: parsed.data.fee,
      description: parsed.data.description || null,
      rules: parsed.data.rules || null,
      equipment: parsed.data.equipment || null,
      notes: parsed.data.notes || null,
      deadline_hours_before: parsed.data.deadlineHoursBefore || null,
    })
    .select('id')
    .single();

  if (error) {
    return {
      success: false,
      error: 'イベントの作成に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  return { success: true, data: { eventId: event.id } };
}

export async function updateEvent(
  id: string,
  data: EventCreateInput
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const parsed = eventCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createClient();

  // イベント存在確認と権限チェック
  const { data: existingEvent } = await supabase
    .from('events')
    .select('organizer_id, start_datetime')
    .eq('id', id)
    .single();

  if (!existingEvent) {
    return {
      success: false,
      error: 'イベントが見つかりません',
      code: 'NOT_FOUND',
    };
  }

  if (existingEvent.organizer_id !== user.id) {
    return {
      success: false,
      error: 'この操作を行う権限がありません',
      code: 'PERMISSION_ERROR',
    };
  }

  if (new Date(existingEvent.start_datetime) <= new Date()) {
    return {
      success: false,
      error: '開始済みのイベントは編集できません',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  const { error } = await supabase
    .from('events')
    .update({
      title: parsed.data.title,
      start_datetime: parsed.data.startDatetime.toISOString(),
      end_datetime: parsed.data.endDatetime.toISOString(),
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress,
      municipality: parsed.data.municipality,
      level: parsed.data.level,
      level_note: parsed.data.levelNote || null,
      capacity: parsed.data.capacity,
      fee: parsed.data.fee,
      description: parsed.data.description || null,
      rules: parsed.data.rules || null,
      equipment: parsed.data.equipment || null,
      notes: parsed.data.notes || null,
      deadline_hours_before: parsed.data.deadlineHoursBefore || null,
    })
    .eq('id', id);

  if (error) {
    return {
      success: false,
      error: 'イベントの更新に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/events/${id}`);
  return { success: true, data: undefined };
}

export async function cancelEvent(id: string): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', id)
    .single();

  if (!event) {
    return {
      success: false,
      error: 'イベントが見つかりません',
      code: 'NOT_FOUND',
    };
  }

  if (event.organizer_id !== user.id) {
    return {
      success: false,
      error: 'この操作を行う権限がありません',
      code: 'PERMISSION_ERROR',
    };
  }

  const { error } = await supabase
    .from('events')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    return {
      success: false,
      error: 'イベントのキャンセルに失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/events/${id}`);
  return { success: true, data: undefined };
}

export async function getEvents(
  filters: EventFilterInput
): Promise<ActionResult<{ events: EventWithCounts[]; totalCount: number }>> {
  const parsed = eventFilterSchema.safeParse(filters);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const { dateRange, municipality, level, page, perPage } = parsed.data;
  const supabase = await createClient();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('events')
    .select('*, organizer:profiles!organizer_id(id, display_name)', {
      count: 'exact',
    })
    .eq('status', 'published')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true });

  if (dateRange) {
    const range = getDateRange(dateRange as DateRangeKey);
    query = query
      .gte('start_datetime', range.from.toISOString())
      .lte('start_datetime', range.to.toISOString());
  }

  if (municipality) {
    query = query.eq('municipality', municipality);
  }

  if (level) {
    query = query.eq('level', level);
  }

  const { data: events, error, count } = await query.range(from, to);

  if (error) {
    return {
      success: false,
      error: 'イベントの取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  // 各イベントの承認済み申請数を取得
  const eventIds = (events || []).map((e) => e.id);
  const { data: approvedCounts } = await supabase
    .from('applications')
    .select('event_id')
    .in('event_id', eventIds.length > 0 ? eventIds : ['__none__'])
    .eq('status', 'approved');

  const countMap: Record<string, number> = {};
  (approvedCounts || []).forEach((a) => {
    countMap[a.event_id] = (countMap[a.event_id] || 0) + 1;
  });

  const mappedEvents: EventWithCounts[] = (events || []).map((e) => ({
    id: e.id,
    organizerId: e.organizer_id,
    title: e.title,
    startDatetime: e.start_datetime,
    endDatetime: e.end_datetime,
    venueName: e.venue_name,
    venueAddress: e.venue_address,
    municipality: e.municipality,
    level: e.level,
    levelNote: e.level_note,
    capacity: e.capacity,
    fee: e.fee,
    description: e.description,
    rules: e.rules,
    equipment: e.equipment,
    notes: e.notes,
    deadlineHoursBefore: e.deadline_hours_before,
    status: e.status,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    organizer: {
      id: (e.organizer as { id: string }).id,
      displayName: (e.organizer as { display_name: string }).display_name,
    },
    approvedCount: countMap[e.id] || 0,
  }));

  return {
    success: true,
    data: { events: mappedEvents, totalCount: count || 0 },
  };
}

export async function getEventById(
  id: string
): Promise<ActionResult<EventWithCounts>> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('*, organizer:profiles!organizer_id(id, display_name)')
    .eq('id', id)
    .single();

  if (error || !event) {
    return {
      success: false,
      error: 'イベントが見つかりません',
      code: 'NOT_FOUND',
    };
  }

  const { count } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('status', 'approved');

  return {
    success: true,
    data: {
      id: event.id,
      organizerId: event.organizer_id,
      title: event.title,
      startDatetime: event.start_datetime,
      endDatetime: event.end_datetime,
      venueName: event.venue_name,
      venueAddress: event.venue_address,
      municipality: event.municipality,
      level: event.level,
      levelNote: event.level_note,
      capacity: event.capacity,
      fee: event.fee,
      description: event.description,
      rules: event.rules,
      equipment: event.equipment,
      notes: event.notes,
      deadlineHoursBefore: event.deadline_hours_before,
      status: event.status,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      organizer: {
        id: (event.organizer as { id: string }).id,
        displayName: (event.organizer as { display_name: string }).display_name,
      },
      approvedCount: count || 0,
    },
  };
}
