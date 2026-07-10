import { motion } from "framer-motion";
import { Download, MoreVertical, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Note {
  id: number;
  title: string;
  preview: string;
  color?: string;
  isPinned?: boolean;
  createdAt?: string;
  folder?: string;
}

interface NotesGridProps {
  notes: Note[];
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
}

export function NotesGrid({
  notes,
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
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {notes.map((note) => (
        <NoteGridItem
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

interface NoteGridItemProps {
  note: Note;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
  variants?: any;
}

function NoteGridItem({
  note,
  onPin,
  onDelete,
  onDownload,
  onClick,
  variants,
}: NoteGridItemProps) {
  const bgColor = note.color || "#f3f4f6";
  const textColor = getContrastColor(bgColor);

  // Extract first line or first 50 chars for preview
  const previewText = note.preview
    ?.split("\n")[0]
    ?.replace(/^#+\s/, "")
    ?.slice(0, 50) || "Untitled";

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
      className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
      onClick={() => onClick?.(note.id)}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: bgColor }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col p-3 z-10">
        {/* Top bar with actions */}
        <div className="flex justify-between items-start mb-auto">
          <div className="flex-1" />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-black/10"
              onClick={(e) => {
                e.stopPropagation();
                onPin?.(note.id);
              }}
            >
              <Pin className={cn("w-3 h-3", note.isPinned ? "fill-current" : "")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-black/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
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

        {/* Title and preview text */}
        <div className="mb-2">
          <h3
            className="font-semibold text-sm line-clamp-2 mb-1"
            style={{ color: textColor }}
          >
            {note.title}
          </h3>
          <p
            className="text-xs line-clamp-2 opacity-75"
            style={{ color: textColor }}
          >
            {previewText}
          </p>
        </div>

        {/* Bottom metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <span
            className="text-xs font-medium"
            style={{ color: textColor, opacity: 0.7 }}
          >
            {note.folder || "Notes"}
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
        }}
      />
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
