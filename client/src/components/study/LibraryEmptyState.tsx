import { FileText, Upload, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LibraryEmptyStateProps {
  type: 'documents' | 'voiceNotes' | 'all';
  onUpload?: () => void;
}

export function LibraryEmptyState({ type, onUpload }: LibraryEmptyStateProps) {
  const configs = {
    documents: {
      icon: FileText,
      title: 'No documents yet',
      description: 'Upload your first document to get started',
      action: 'Upload Document',
    },
    voiceNotes: {
      icon: BookOpen,
      title: 'No voice notes yet',
      description: 'Record or upload your first voice note',
      action: 'Add Voice Note',
    },
    all: {
      icon: Upload,
      title: 'Your library is empty',
      description: 'Start by uploading documents or recording voice notes',
      action: 'Get Started',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 bg-muted rounded-full">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {config.description}
      </p>
      {onUpload && (
        <Button onClick={onUpload} className="gap-2">
          <Upload className="w-4 h-4" />
          {config.action}
        </Button>
      )}
    </div>
  );
}
