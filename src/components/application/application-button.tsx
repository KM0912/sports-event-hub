'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { applyToEvent, cancelApplication } from '@/actions/application-actions';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ApplicationButtonProps {
  eventId: string;
  organizerId: string;
  userId: string;
}

type ExistingApplication = {
  id: string;
  status: string;
} | null;

export function ApplicationButton({
  eventId,
  organizerId,
  userId,
}: ApplicationButtonProps) {
  const [existing, setExisting] = useState<ExistingApplication>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchExisting() {
      const supabase = createClient();
      const { data } = await supabase
        .from('applications')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('applicant_id', userId)
        .in('status', ['pending', 'approved'])
        .maybeSingle();
      setExisting(data);
      setLoading(false);
    }
    fetchExisting();
  }, [eventId, userId]);

  if (organizerId === userId) return null;
  if (loading) return null;

  async function handleApply() {
    setSubmitting(true);
    const result = await applyToEvent(eventId, comment || undefined);
    setSubmitting(false);

    if (result.success) {
      toast.success('申請しました');
      setExisting({ id: result.data.applicationId, status: 'pending' });
      setOpen(false);
      setComment('');
    } else {
      toast.error(result.error);
    }
  }

  async function handleCancel() {
    if (!existing) return;
    setSubmitting(true);
    const result = await cancelApplication(existing.id);
    setSubmitting(false);

    if (result.success) {
      toast.success('申請をキャンセルしました');
      setExisting(null);
    } else {
      toast.error(result.error);
    }
  }

  if (existing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {existing.status === 'pending' ? '申請中' : '参加確定'}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={submitting}
        >
          {submitting ? '処理中...' : 'キャンセル'}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">参加を申請する</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>参加申請</DialogTitle>
          <DialogDescription>
            主催者へのコメントを添えて申請できます（任意）
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="コメント（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleApply} disabled={submitting}>
            {submitting ? '送信中...' : '申請する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
