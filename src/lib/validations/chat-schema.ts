import { z } from 'zod';

export const chatMessageSchema = z.object({
  eventId: z.string().uuid('無効なイベントIDです'),
  receiverId: z.string().uuid('無効なユーザーIDです'),
  content: z
    .string()
    .min(1, 'メッセージを入力してください')
    .max(500, 'メッセージは500文字以内です'),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
