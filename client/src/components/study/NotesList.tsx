import { motion } from "framer-motion";
import { Download, MoreVertical, Pin, Trash2, FileText } from "lucide-react";
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
  folder?: string;
}

interface NotesListProps {
  notes: Note[];
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
}

export function NotesList({
  notes,
  onPin,
  onDelete,
  onDownload,
  onClick,
}: NotesListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="space-y-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {notes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
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

interface NoteListItemProps {
  note: Note;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
  variants?: any;
}

function NoteListItem({
  note,
  onPin,
  onDelete,
  onDownload,
  onClick,
  variants,
}: NoteListItemProps) {
  const bgColor = note.color || "#f3f4f6";
  const textColor = getContrastColor(bgColor);

  // Extract first line for preview
  const previewText = note.preview
    ?.split("\n")[0]
    ?.replace(/^#+\s/, "")
    ?.slice(0, 80) || "No preview";

  const formattedDate = note.createdAt
    ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
    : "";

  return (
    <motion.div
      variants={variants}
      whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.02)" }}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onClick?.(note.id)}
    >
      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      />

      {/* Icon */}
      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate" style={{ color: textColor }}>
          {note.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {previewText}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {note.folder && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {note.folder}
          </span>
        )}
        {formattedDate && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {formattedDate}
          </span>
        )}

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onPin?.(note.id);
            }}
          >
            <Pin
              className={cn(
                "w-3.5 h-3.5",
                note.isPinned ? "fill-current" : ""
              )}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3.5 h-3.5" />
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
    </motion.div>
  );
}

function getContrastColor(hexColor: string): string {
  if (!hexColor || hexColor.length < 7) return "#000";

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000" : "#fff";
}
