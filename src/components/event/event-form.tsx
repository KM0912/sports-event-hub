'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MUNICIPALITIES } from '@/constants/municipalities';
import { EVENT_LEVEL_OPTIONS } from '@/constants/levels';
import { createEvent, updateEvent } from '@/actions/event-actions';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import type { EventCreateInput } from '@/lib/validations/event-schema';

interface EventFormProps {
  eventId?: string;
  initialData?: Partial<
    EventCreateInput & { municipality: string; level: string }
  >;
}

export function EventForm({ eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!eventId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data: EventCreateInput = {
      title: formData.get('title') as string,
      startDatetime: new Date(formData.get('startDatetime') as string),
      endDatetime: new Date(formData.get('endDatetime') as string),
      venueName: formData.get('venueName') as string,
      venueAddress: formData.get('venueAddress') as string,
      municipality: formData.get('municipality') as string,
      level: formData.get('level') as EventCreateInput['level'],
      levelNote: (formData.get('levelNote') as string) || undefined,
      capacity: Number(formData.get('capacity')),
      fee: Number(formData.get('fee')),
      description: (formData.get('description') as string) || undefined,
      rules: (formData.get('rules') as string) || undefined,
      equipment: (formData.get('equipment') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
      deadlineHoursBefore: formData.get('deadlineHoursBefore')
        ? Number(formData.get('deadlineHoursBefore'))
        : undefined,
    };

    const result = isEdit
      ? await updateEvent(eventId, data)
      : await createEvent(data);

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? 'イベントを更新しました' : 'イベントを作成しました');
    if (!isEdit && 'data' in result && result.data) {
      router.push(ROUTES.DASHBOARD);
    } else {
      router.push(ROUTES.DASHBOARD);
    }
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-2xl border-border/60 shadow-lg">
      <CardHeader className="border-b border-border/40 bg-muted/30">
        <CardTitle className="text-lg">
          {isEdit ? 'イベント編集' : '練習会を作成'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-semibold text-primary">
              基本情報
            </legend>
            <div className="space-y-2">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initialData?.title}
                maxLength={100}
                placeholder="例: 仙台バドミントン練習会"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDatetime">開始日時 *</Label>
                <Input
                  id="startDatetime"
                  name="startDatetime"
                  type="datetime-local"
                  defaultValue={
                    initialData?.startDatetime
                      ? new Date(initialData.startDatetime)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDatetime">終了日時 *</Label>
                <Input
                  id="endDatetime"
                  name="endDatetime"
                  type="datetime-local"
                  defaultValue={
                    initialData?.endDatetime
                      ? new Date(initialData.endDatetime)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* 会場情報 */}
          <fieldset className="space-y-4 border-t border-border/40 pt-6">
            <legend className="mb-2 text-sm font-semibold text-primary">
              会場情報
            </legend>
            <div className="space-y-2">
              <Label htmlFor="venueName">会場名 *</Label>
              <Input
                id="venueName"
                name="venueName"
                defaultValue={initialData?.venueName}
                maxLength={100}
                placeholder="例: 仙台市体育館"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueAddress">住所 *</Label>
              <Input
                id="venueAddress"
                name="venueAddress"
                defaultValue={initialData?.venueAddress}
                maxLength={200}
                placeholder="例: 仙台市青葉区本町3-8-1"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>市区町村 *</Label>
                <Select
                  name="municipality"
                  defaultValue={initialData?.municipality}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPALITIES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>レベル *</Label>
                <Select name="level" defaultValue={initialData?.level} required>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="levelNote">レベル補足メモ</Label>
              <Input
                id="levelNote"
                name="levelNote"
                defaultValue={initialData?.levelNote ?? ''}
                maxLength={200}
                placeholder="例: 初心者〜始めて1年以内の方"
              />
            </div>
          </fieldset>

          {/* 募集条件 */}
          <fieldset className="space-y-4 border-t border-border/40 pt-6">
            <legend className="mb-2 text-sm font-semibold text-primary">
              募集条件
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="capacity">定員（ビジター枠） *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  defaultValue={initialData?.capacity}
                  placeholder="例: 8"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">参加費（円） *</Label>
                <Input
                  id="fee"
                  name="fee"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={initialData?.fee}
                  placeholder="例: 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineHoursBefore">募集締切（時間前）</Label>
                <Input
                  id="deadlineHoursBefore"
                  name="deadlineHoursBefore"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={72}
                  defaultValue={initialData?.deadlineHoursBefore ?? ''}
                  placeholder="例: 24"
                />
              </div>
            </div>
          </fieldset>

          {/* 詳細情報 */}
          <fieldset className="space-y-4 border-t border-border/40 pt-6">
            <legend className="mb-2 text-sm font-semibold text-primary">
              詳細情報
            </legend>
            <div className="space-y-2">
              <Label htmlFor="description">説明文</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialData?.description ?? ''}
                maxLength={2000}
                rows={4}
                placeholder="練習会の内容や雰囲気などを記載してください"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">参加ルール</Label>
              <Textarea
                id="rules"
                name="rules"
                defaultValue={initialData?.rules ?? ''}
                maxLength={1000}
                rows={3}
                placeholder="参加時のルールや注意事項があれば記載してください"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">持ち物・装備</Label>
              <Textarea
                id="equipment"
                name="equipment"
                defaultValue={initialData?.equipment ?? ''}
                maxLength={500}
                rows={2}
                placeholder="ラケット、室内シューズ、タオル、飲み物など"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={initialData?.notes ?? ''}
                maxLength={1000}
                rows={2}
                placeholder="駐車場情報やその他の連絡事項など"
              />
            </div>
          </fieldset>

          <Button
            type="submit"
            className="w-full gap-2 font-semibold shadow-sm"
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEdit ? '更新する' : '練習会を作成する'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
