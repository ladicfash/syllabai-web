import { motion } from "framer-motion";
import { Download, MoreVertical, Pin, Trash2, FileText, Check, Minus, ArrowUp, ArrowDown } from "lucide-react";
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

type SortField = "modified" | "name" | "size";
type SortDir = "asc" | "desc";

interface NotesListProps {
  notes: Note[];
  selectedIds?: Set<number>;
  onSelect?: (id: number) => void;
  sortField?: SortField;
  sortDir?: SortDir;
  onSortChange?: (field: SortField) => void;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
}

function formatSize(text: string): string {
  const bytes = typeof Blob !== "undefined" ? new Blob([text || ""]).size : (text || "").length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function SortHeader({
  label,
  field,
  active,
  sortDir,
  onSortChange,
  className,
}: {
  label: string;
  field: SortField;
  active: boolean;
  sortDir?: SortDir;
  onSortChange?: (field: SortField) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSortChange?.(field)}
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      {active && (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
    </button>
  );
}

export function NotesList({
  notes,
  selectedIds,
  onSelect,
  sortField,
  sortDir,
  onSortChange,
  onPin,
  onDelete,
  onDownload,
  onClick,
}: NotesListProps) {
  const allSelected = notes.length > 0 && notes.every(n => selectedIds?.has(n.id));
  const someSelected = !allSelected && notes.some(n => selectedIds?.has(n.id));

  const handleSelectAll = () => {
    if (allSelected) {
      notes.forEach(n => { if (selectedIds?.has(n.id)) onSelect?.(n.id); });
    } else {
      notes.forEach(n => { if (!selectedIds?.has(n.id)) onSelect?.(n.id); });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.015 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.15 } },
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-muted/40">
        <button
          type="button"
          onClick={handleSelectAll}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
            allSelected || someSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border bg-background"
          )}
          title={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected && <Check className="w-3 h-3" />}
          {someSelected && <Minus className="w-3 h-3" />}
        </button>
        <div className="w-4 flex-shrink-0" />
        <SortHeader label="Name" field="name" active={sortField === "name"} sortDir={sortDir} onSortChange={onSortChange} className="flex-1 min-w-0" />
        <span className="w-28 hidden sm:block text-xs font-medium uppercase tracking-wide text-muted-foreground flex-shrink-0">Folder</span>
        <SortHeader label="Last modified" field="modified" active={sortField === "modified"} sortDir={sortDir} onSortChange={onSortChange} className="w-32 hidden md:flex flex-shrink-0" />
        <SortHeader label="Size" field="size" active={sortField === "size"} sortDir={sortDir} onSortChange={onSortChange} className="w-16 hidden lg:flex flex-shrink-0 justify-end" />
        <div className="w-16 flex-shrink-0" />
      </div>

      {/* Rows */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {notes.map((note) => (
          <NoteListItem
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
    </div>
  );
}

interface NoteListItemProps {
  note: Note;
  selected: boolean;
  onSelect?: (id: number) => void;
  onPin?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  onClick?: (id: number) => void;
  variants?: any;
}

function NoteListItem({
  note,
  selected,
  onSelect,
  onPin,
  onDelete,
  onDownload,
  onClick,
  variants,
}: NoteListItemProps) {
  const accent = note.color || "#94a3b8";

  const previewText = note.preview
    ?.split("\n")[0]
    ?.replace(/^#+\s/, "")
    ?.slice(0, 80) || "No preview";

  const formattedDate = (note.updatedAt || note.createdAt)
    ? formatDistanceToNow(new Date(note.updatedAt || note.createdAt || ""), { addSuffix: true })
    : "";

  return (
    <motion.div
      variants={variants}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 cursor-pointer transition-colors",
        selected ? "bg-primary/5" : "hover:bg-accent/50"
      )}
      onClick={() => onClick?.(note.id)}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect?.(note.id); }}
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

      {/* File icon, tinted by note colour */}
      <div
        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accent}18` }}
      >
        <FileText className="w-3.5 h-3.5" style={{ color: accent }} strokeWidth={1.75} />
      </div>

      {/* Name + preview */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground truncate">
          {note.title || "Untitled"}
        </h3>
        <p className="text-xs text-muted-foreground truncate sm:hidden">
          {previewText}
        </p>
      </div>

      {/* Folder */}
      <span className="w-28 hidden sm:block text-xs text-muted-foreground truncate flex-shrink-0">
        {note.folder || "—"}
      </span>

      {/* Last modified */}
      <span className="w-32 hidden md:block text-xs text-muted-foreground truncate flex-shrink-0">
        {formattedDate}
      </span>

      {/* Size */}
      <span className="w-16 hidden lg:block text-xs text-muted-foreground text-right flex-shrink-0">
        {formatSize(note.preview)}
      </span>

      {/* Actions */}
      <div className="w-16 flex items-center justify-end gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); onPin?.(note.id); }}
          title={note.isPinned ? "Unpin" : "Pin"}
        >
          <Pin className={cn("w-3.5 h-3.5", note.isPinned ? "fill-current text-primary" : "")} />
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
              onClick={(e) => { e.stopPropagation(); onDownload?.(note.id); }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete?.(note.id); }}
              className="gap-2 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
