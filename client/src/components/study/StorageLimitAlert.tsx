import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface StorageLimitAlertProps {
  type: 'notes' | 'voiceMemos' | 'documents';
  current: number;
  limit: number;
  showAlert?: boolean;
}

export function StorageLimitAlert({
  type,
  current,
  limit,
  showAlert = true,
}: StorageLimitAlertProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  const labels = {
    notes: 'Notes',
    voiceMemos: 'Voice Memos',
    documents: 'Documents',
  };

  if (!showAlert || percentage < 80) return null;

  return (
    <Alert variant={isAtLimit ? 'destructive' : 'default'} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">
            {isAtLimit
              ? `${labels[type]} limit reached (${current}/${limit})`
              : `${labels[type]} storage at ${Math.round(percentage)}% (${current}/${limit})`}
          </p>
          <Progress value={Math.min(percentage, 100)} className="h-2" />
          {isAtLimit && (
            <p className="text-sm">
              Please delete some items to create more space.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
