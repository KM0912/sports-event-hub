import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, '表示名は2文字以上です')
    .max(20, '表示名は20文字以内です'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
