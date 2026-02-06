'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, Clock, X } from 'lucide-react';
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
    const isPending = existing.status === 'pending';
    return (
      <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 ring-1 ring-border/40">
        <div className="flex flex-1 items-center gap-2">
          {isPending ? (
            <Clock className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <span className="text-sm font-medium">
            {isPending ? '申請中' : '参加確定'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={submitting}
          className="gap-1 border-border/60"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          キャンセル
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 font-semibold shadow-sm" size="lg">
          <Send className="h-4 w-4" />
          参加を申請する
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            参加申請
          </DialogTitle>
          <DialogDescription>
            主催者へのコメントを添えて申請できます（任意）
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="自己紹介や参加動機など（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            やめる
          </Button>
          <Button
            onClick={handleApply}
            disabled={submitting}
            className="gap-1.5 font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                申請する
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
