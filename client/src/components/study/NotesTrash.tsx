import { Trash2, RotateCcw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';

interface DeletedNote {
  id: number;
  title: string;
  color: string;
  deletedAt: Date;
}

interface NotesTrashProps {
  deletedNotes: DeletedNote[];
  onRestore: (id: number) => void;
  onPermanentDelete: (id: number) => void;
}

export function NotesTrash({
  deletedNotes,
  onRestore,
  onPermanentDelete,
}: NotesTrashProps) {
  if (deletedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trash2 className="w-12 h-12 text-muted-foreground mb-3" />
        <h3 className="font-semibold">Trash is empty</h3>
        <p className="text-sm text-muted-foreground">Deleted notes will appear here for 30 days</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Recently Deleted ({deletedNotes.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deletedNotes.map((note) => (
          <Card
            key={note.id}
            className="p-4 border-2 border-dashed hover:border-solid transition-all"
            style={{ borderColor: note.color + '40', backgroundColor: note.color + '10' }}
          >
            <div className="space-y-3">
              <p className="font-medium text-sm truncate">{note.title}</p>
              <p className="text-xs text-muted-foreground">
                Deleted {note.deletedAt.toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRestore(note.id)}
                  className="flex-1 gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPermanentDelete(note.id)}
                  className="flex-1 gap-1 text-destructive hover:text-destructive"
                >
                  <Trash className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
