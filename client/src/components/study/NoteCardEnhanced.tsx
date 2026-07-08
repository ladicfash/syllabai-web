import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { generatePreview } from "@/lib/noteDownload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Pin, PinOff, Trash2, Edit3, Check, X, Download, FileJson, FileText,
  FolderInput, Brush, MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NOTE_COLORS: string[] = [
  "#ffcccc", "#ff9999", "#ff6666",
  "#ffd9b3", "#ffb366", "#ff8c00",
  "#fff9c4", "#fff176", "#ffd600",
  "#f0f4c3", "#dce775", "#c6e03e",
  "#c8f5d0", "#81e89b", "#34c759",
  "#b2ebf2", "#4dd0e1", "#00acc1",
  "#bbdefb", "#64b5f6", "#1e88e5",
  "#c5cae9", "#7986cb", "#3949ab",
  "#e1bee7", "#ba68c8", "#8e24aa",
  "#f8bbd0", "#f48fb1", "#e91e8c",
];

function contrastColor(hex: string): string {
  if (!hex || hex.length < 7) return "#1a1a1a";
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.35 ? "#1a1a1a" : "#f5f5f5";
}

function borderColor(hex: string): string {
  if (!hex || hex.length < 7) return "#e5e7eb";
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 35);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 35);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 35);
  return `rgb(${r},${g},${b})`;
}

function countWhiteboardObjects(raw: string): number {
  try {
    const match = raw.match(/^<!--syllabai-whiteboard:[^\n]*\n([\s\S]*?)\n-->$/);
    if (!match) return 0;
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed?.objects) ? parsed.objects.length : 0;
  } catch {
    return 0;
  }
}

interface NoteCardEnhancedProps {
  note: any;
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
  folders: any[];
  onMove: (noteId: number, folderId: number | null) => void;
  selected: boolean;
  onSelect: (id: number) => void;
  onOpenWhiteboard?: (note: any) => void;
  onDownload?: (note: any, format: string) => void;
}

export function NoteCardEnhanced({
  note,
  onUpdate,
  onDelete,
  folders,
  onMove,
  selected,
  onSelect,
  onOpenWhiteboard,
  onDownload,
}: NoteCardEnhancedProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showMove, setShowMove] = useState(false);

  const bg = note.color || NOTE_COLORS[6];
  const fg = contrastColor(bg);
  const border = borderColor(bg);

  const save = () => {
    onUpdate(note.id, { title, content });
    setEditing(false);
  };

  // Generate preview text (first 150 chars)
  const getPreview = () => {
    if (typeof note.content === "string" && note.content.startsWith("<!--syllabai-whiteboard:")) {
      return `Whiteboard · ${countWhiteboardObjects(note.content)} objects`;
    }
    const raw = note.preview || note.content || "";
    return generatePreview(raw, 150);
  };

  const formatBadge = note.format || "markdown";

  return (
    <div
      className={cn(
        "rounded-lg border-2 overflow-hidden transition-all duration-200 group relative shadow-sm hover:shadow-lg",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: bg, borderColor: border }}
    >
      {/* Header with title and actions */}
      <div className="p-3 pb-2 border-b" style={{ borderBottomColor: `${fg}20` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: fg }}>
              {note.title || "Untitled Note"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: fg, opacity: 0.6 }}>
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {note.isPinned && <Pin className="w-3.5 h-3.5" style={{ color: fg }} />}
          </div>
        </div>
      </div>

      {/* Preview content */}
      <div className="p-3 pb-2 min-h-[60px] flex items-start">
        <p className="text-xs leading-relaxed line-clamp-4" style={{ color: fg, opacity: 0.8 }}>
          {getPreview()}
        </p>
      </div>

      {/* Footer with metadata and actions */}
      <div className="p-3 pt-2 bg-black/5 dark:bg-white/5 border-t" style={{ borderTopColor: `${fg}20` }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Format badge */}
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${fg}20`,
                color: fg,
              }}
            >
              {formatBadge}
            </span>

            {/* Folder badge if applicable */}
            {note.folderId && folders.find(f => f.id === note.folderId) && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${folders.find(f => f.id === note.folderId)?.color}30`,
                  color: folders.find(f => f.id === note.folderId)?.color,
              }}
              >
                {folders.find(f => f.id === note.folderId)?.name}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(note.id)}
              className="w-3.5 h-3.5 cursor-pointer rounded"
              title="Select note"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-3.5 h-3.5" style={{ color: fg }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}>
                  {note.isPinned ? (
                    <>
                      <PinOff className="w-3.5 h-3.5 mr-2" /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5 mr-2" /> Pin
                    </>
                  )}
                </DropdownMenuItem>

                {onOpenWhiteboard && typeof note.content === "string" && note.content.startsWith("<!--syllabai-whiteboard:") && (
                  <DropdownMenuItem onClick={() => onOpenWhiteboard(note)}>
                    <Brush className="w-3.5 h-3.5 mr-2" /> Edit Whiteboard
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>

                {/* Download submenu */}
                {onDownload && (
                  <>
                    <DropdownMenuItem onClick={() => onDownload(note, "markdown")}>
                      <Download className="w-3.5 h-3.5 mr-2" /> Download as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(note, "json")}>
                      <FileJson className="w-3.5 h-3.5 mr-2" /> Download as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(note, "html")}>
                      <FileText className="w-3.5 h-3.5 mr-2" /> Download as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(note, "txt")}>
                      <FileText className="w-3.5 h-3.5 mr-2" /> Download as Text
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem onClick={() => setShowMove(true)}>
                  <FolderInput className="w-3.5 h-3.5 mr-2" /> Move to Folder
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-red-500">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Edit mode overlay */}
      {editing && (
        <div className="absolute inset-0 bg-black/80 rounded-lg p-4 flex flex-col gap-2 z-50">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-sm font-semibold border-0 shadow-none px-0 h-auto bg-transparent text-white"
            placeholder="Title"
          />
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="text-sm border-0 shadow-none px-0 resize-none min-h-[80px] bg-transparent text-white flex-1"
            placeholder="Content"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="h-7 text-xs gap-1">
              <Check className="w-3 h-3" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs gap-1">
              <X className="w-3 h-3" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Move folder menu */}
      {showMove && (
        <div className="absolute bottom-12 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[160px]">
          <button
            onClick={() => { onMove(note.id, null); setShowMove(false); }}
            className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <X className="w-3 h-3" /> No folder
          </button>
          {folders?.map((f: any) => (
            <button
              key={f.id}
              onClick={() => { onMove(note.id, f.id); setShowMove(false); }}
              className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
