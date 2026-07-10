import { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  color: string;
  [key: string]: any;
}

interface DragDropNotesProps {
  notes: Note[];
  onReorder: (reorderedNotes: Note[]) => void;
  renderNote: (note: Note, isDragging: boolean) => React.ReactNode;
}

export function DragDropNotes({
  notes,
  onReorder,
  renderNote,
}: DragDropNotesProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderedNotes, setOrderedNotes] = useState(notes);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newNotes = [...orderedNotes];
    const draggedNote = newNotes[draggedIndex];
    newNotes.splice(draggedIndex, 1);
    newNotes.splice(index, 0, draggedNote);

    setOrderedNotes(newNotes);
    onReorder(newNotes);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {orderedNotes.map((note, index) => (
        <div
          key={note.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={() => handleDragOver(index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 group cursor-move transition-all ${
            draggedIndex === index ? 'opacity-50' : ''
          } ${dragOverIndex === index ? 'scale-105 ring-2 ring-primary' : ''}`}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1">
            {renderNote(note, draggedIndex === index)}
          </div>
        </div>
      ))}
    </div>
  );
}
