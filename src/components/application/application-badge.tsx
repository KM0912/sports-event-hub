import { Badge } from '@/components/ui/badge';
import { APPLICATION_STATUS } from '@/constants/application-status';
import type { ApplicationStatus } from '@/types/application';

const colorVariants: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  const config = APPLICATION_STATUS[status];
  return (
    <Badge variant="outline" className={colorVariants[config.color]}>
      {config.label}
    </Badge>
  );
}
