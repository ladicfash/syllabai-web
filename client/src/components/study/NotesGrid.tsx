import { motion } from "framer-motion";
import { Download, MoreVertical, Pin, Trash2, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: number;
  title: string;
  preview: string;
  color?: string;
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
  folder?: string;
}

interface NotesGridProps {
  notes: Note[];
  selectedIds?: Set<number>;
  onSelect?: (id: number) => void;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
}

export function NotesGrid({
  notes,
  selectedIds,
  onSelect,
  onPin,
  onDelete,
  onDownload,
  onClick,
}: NotesGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 auto-rows-max"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {notes.map((note) => (
        <NoteGridItem
          key={note.id}
          note={note}
          selected={selectedIds?.has(note.id) ?? false}
          onSelect={onSelect}
          onPin={onPin}
          onDelete={onDelete}
          onDownload={onDownload}
          onClick={onClick}
          variants={itemVariants}
        />
      ))}
    </motion.div>
  );
}

interface NoteGridItemProps {
  note: Note;
  selected: boolean;
  onSelect?: (id: number) => void;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
  variants?: any;
}

function NoteGridItem({
  note,
  selected,
  onSelect,
  onPin,
  onDelete,
  onDownload,
  onClick,
  variants,
}: NoteGridItemProps) {
  const accent = note.color || "#94a3b8";

  // Extract first line or first 60 chars for the filename-style subtitle
  const previewText = note.preview
    ?.split("\n")[0]
    ?.replace(/^#+\s/, "")
    ?.slice(0, 60) || "Empty note";

  const formattedDate = (note.updatedAt || note.createdAt)
    ? formatDistanceToNow(new Date(note.updatedAt || note.createdAt || ""), { addSuffix: true })
    : "";

  return (
    <motion.div
      variants={variants}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card overflow-hidden cursor-pointer transition-all",
        selected
          ? "border-primary ring-1 ring-primary bg-primary/5"
          : "border-border hover:border-foreground/20 hover:shadow-md"
      )}
      onClick={() => onClick?.(note.id)}
    >
      {/* Thin colour accent, like a file-type stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />

      {/* Top bar: checkbox (hover/selected) + actions (hover) */}
      <div className="flex items-center justify-between px-2.5 pt-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(note.id);
          }}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-opacity flex-shrink-0",
            selected
              ? "opacity-100 bg-primary border-primary text-primary-foreground"
              : "opacity-0 group-hover:opacity-100 border-border bg-background"
          )}
          title={selected ? "Deselect note" : "Select note"}
        >
          {selected && <Check className="w-3 h-3" />}
        </button>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onPin?.(note.id);
            }}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <Pin className={cn("w-3 h-3", note.isPinned ? "fill-current text-primary" : "text-muted-foreground")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(note.id);
                }}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(note.id);
                }}
                className="gap-2 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* File icon area, tinted faintly by the note's colour */}
      <div
        className="mx-2.5 mt-2 mb-2.5 aspect-[4/3] rounded-md flex items-center justify-center"
        style={{ backgroundColor: `${accent}14` }}
      >
        <FileText className="w-7 h-7" style={{ color: accent }} strokeWidth={1.5} />
      </div>

      {/* Filename + metadata */}
      <div className="px-2.5 pb-2.5">
        <h3 className="font-medium text-sm text-foreground truncate">
          {note.title || "Untitled"}
        </h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {previewText}
        </p>
        <div className="flex items-center justify-between mt-1.5 gap-1.5">
          <span className="text-[11px] text-muted-foreground truncate">
            {note.folder || "Notes"}
          </span>
          {formattedDate && (
            <span className="text-[11px] text-muted-foreground flex-shrink-0">
              {formattedDate}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
