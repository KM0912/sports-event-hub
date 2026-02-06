'use client';

import { useState } from 'react';
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
      <p className="text-center text-muted-foreground">申請はまだありません</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        承認済み: {approvedCount} / {capacity}名
      </p>
      {applications.map((app) => (
        <Card key={app.id}>
          <CardContent className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{app.applicant.displayName}</span>
                <ApplicationBadge status={app.status} />
              </div>
              {app.comment && (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {app.comment}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(app.createdAt)}
              </p>
            </div>
            {app.status === 'pending' && (
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(app.id)}
                  disabled={processingId === app.id || isFull}
                >
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(app.id)}
                  disabled={processingId === app.id}
                >
                  拒否
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(app.id, true)}
                  disabled={processingId === app.id}
                >
                  拒否+ブロック
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
