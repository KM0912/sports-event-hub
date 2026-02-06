import { z } from 'zod';

export const applicationCreateSchema = z.object({
  eventId: z.string().uuid('無効なイベントIDです'),
  comment: z.string().max(500, 'コメントは500文字以内です').optional(),
});

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;

export const applicationRejectSchema = z.object({
  applicationId: z.string().uuid('無効な申請IDです'),
  block: z.boolean().optional().default(false),
});

export type ApplicationRejectInput = z.infer<typeof applicationRejectSchema>;
