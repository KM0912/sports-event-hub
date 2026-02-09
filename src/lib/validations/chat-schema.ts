import { z } from 'zod';

export const chatMessageSchema = z.object({
  eventId: z.string().min(1, '無効なイベントIDです'),
  receiverId: z.string().min(1, '無効なユーザーIDです'),
  content: z
    .string()
    .min(1, 'メッセージを入力してください')
    .max(500, 'メッセージは500文字以内です'),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
