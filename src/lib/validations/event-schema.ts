import { z } from 'zod';
import { MUNICIPALITIES } from '@/constants/municipalities';

const eventLevelEnum = z.enum([
  'beginner',
  'elementary',
  'intermediate',
  'advanced',
  'all',
]);

export const eventCreateSchema = z
  .object({
    title: z
      .string()
      .min(1, 'タイトルは必須です')
      .max(100, 'タイトルは100文字以内です'),
    startDatetime: z.coerce.date({ message: '開始日時を入力してください' }),
    endDatetime: z.coerce.date({ message: '終了日時を入力してください' }),
    venueName: z
      .string()
      .min(1, '会場名は必須です')
      .max(100, '会場名は100文字以内です'),
    venueAddress: z
      .string()
      .min(1, '住所は必須です')
      .max(200, '住所は200文字以内です'),
    municipality: z.enum(MUNICIPALITIES as unknown as [string, ...string[]], {
      message: '市区町村を選択してください',
    }),
    level: eventLevelEnum,
    levelNote: z.string().max(200, 'レベル補足は200文字以内です').optional(),
    capacity: z
      .number({ message: '定員を入力してください' })
      .int('定員は整数で入力してください')
      .min(1, '定員は1人以上です'),
    fee: z
      .number({ message: '参加費を入力してください' })
      .int('参加費は整数で入力してください')
      .min(0, '参加費は0円以上です'),
    description: z.string().max(2000, '説明文は2000文字以内です').optional(),
    rules: z.string().max(1000, '参加ルールは1000文字以内です').optional(),
    equipment: z.string().max(500, '持ち物は500文字以内です').optional(),
    notes: z.string().max(1000, '備考は1000文字以内です').optional(),
    deadlineHoursBefore: z
      .number()
      .int()
      .min(1, '募集締切は1時間以上です')
      .max(72, '募集締切は72時間以内です')
      .optional(),
  })
  .refine((data) => data.endDatetime > data.startDatetime, {
    message: '終了日時は開始日時より後にしてください',
    path: ['endDatetime'],
  });

export type EventCreateInput = z.infer<typeof eventCreateSchema>;

export const eventFilterSchema = z.object({
  dateRange: z
    .enum(['today', 'this_week', 'next_week', 'this_month', 'next_month'])
    .optional(),
  municipality: z.string().optional(),
  level: eventLevelEnum.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type EventFilterInput = z.infer<typeof eventFilterSchema>;
