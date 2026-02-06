'use client';

import { useState } from 'react';
import {
  UserCheck,
  UserX,
  ShieldBan,
  Users,
  MessageSquare,
  Clock,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApplicationBadge } from './application-badge';
import {
  approveApplication,
  rejectApplication,
} from '@/actions/application-actions';
import type { ApplicationWithApplicant } from '@/types/application';
import { formatDate } from '@/lib/utils/date-utils';
import { toast } from 'sonner';

interface ApplicationListProps {
  applications: ApplicationWithApplicant[];
  capacity: number;
}

export function ApplicationList({
  applications: initialApplications,
  capacity,
}: ApplicationListProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const approvedCount = applications.filter(
    (a) => a.status === 'approved'
  ).length;
  const pendingCount = applications.filter(
    (a) => a.status === 'pending'
  ).length;
  const isFull = approvedCount >= capacity;

  async function handleApprove(id: string) {
    setProcessingId(id);
    const result = await approveApplication(id);
    setProcessingId(null);

    if (result.success) {
      toast.success('承認しました');
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
      );
    } else {
      toast.error(result.error);
    }
  }

  async function handleReject(id: string, block: boolean = false) {
    setProcessingId(id);
    const result = await rejectApplication(id, block);
    setProcessingId(null);

    if (result.success) {
      toast.success(block ? '拒否してブロックしました' : '拒否しました');
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
      );
    } else {
      toast.error(result.error);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <ClipboardList className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <p className="text-base font-medium text-muted-foreground">
          申請はまだありません
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          参加希望者からの申請がここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* サマリー */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 ring-1 ring-border/40">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Users className="h-4 w-4 text-primary" />
          承認済み {approvedCount} / {capacity}名
        </span>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
            <Clock className="h-3.5 w-3.5" />
            保留中 {pendingCount}件
          </span>
        )}
        {isFull && (
          <span className="ml-auto rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-200">
            定員に達しました
          </span>
        )}
      </div>

      {/* 申請リスト */}
      {applications.map((app) => {
        const isProcessing = processingId === app.id;

        return (
          <Card
            key={app.id}
            className="border-border/60 py-0 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {app.applicant.displayName.charAt(0)}
                      </div>
                      <span className="truncate font-semibold">
                        {app.applicant.displayName}
                      </span>
                      <ApplicationBadge status={app.status} />
                    </div>
                    {app.comment && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {app.comment}
                        </p>
                      </div>
                    )}
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Clock className="h-3 w-3" />
                      {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>
                {app.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(app.id)}
                      disabled={isProcessing || isFull}
                      className="h-9 flex-1 gap-1 shadow-sm sm:flex-none"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                      承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(app.id)}
                      disabled={isProcessing}
                      className="h-9 flex-1 gap-1 border-border/60 sm:flex-none"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserX className="h-3.5 w-3.5" />
                      )}
                      拒否
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(app.id, true)}
                      disabled={isProcessing}
                      className="h-9 flex-1 gap-1 sm:flex-none"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldBan className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">拒否+ブロック</span>
                      <span className="sm:hidden">ブロック</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
