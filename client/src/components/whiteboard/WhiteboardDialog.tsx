/**
 * Dialog wrapper for opening the Whiteboard as a "new note" experience.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Palette, Brush, Sparkles } from "lucide-react";
import Whiteboard, { renderWhiteboardToPng, type WhiteboardSnapshot } from "@/components/whiteboard/Whiteboard";

const NOTE_COLORS = [
  "#fef3c7", "#fde68a", "#fcd34d",
  "#fecaca", "#fca5a5", "#f87171",
  "#bbf7d0", "#86efac", "#4ade80",
  "#bfdbfe", "#93c5fd", "#60a5fa",
  "#ddd6fe", "#c4b5fd", "#a78bfa",
  "#fbcfe8", "#f9a8d4", "#f472b6",
  "#f5f5f5", "#e5e7eb", "#d1d5db",
];

interface WhiteboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; content: string; color: string; folderId?: number }) => Promise<unknown>;
  folders?: Array<{ id: number; name: string; color: string }>;
  defaultFolderId?: number | null;
}

export default function WhiteboardDialog({
  open,
  onOpenChange,
  onSave,
  folders = [],
  defaultFolderId = null,
}: WhiteboardDialogProps) {
  const [title, setTitle] = useState("Whiteboard Note");
  const [color, setColor] = useState<string>(NOTE_COLORS[0]);
  const [snapshot, setSnapshot] = useState<WhiteboardSnapshot | null>(null);
  const [folderId, setFolderId] = useState<number | null>(defaultFolderId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!snapshot) return;
    setSaving(true);
    try {
      const preview = renderWhiteboardToPng(snapshot);
      const json = JSON.stringify(snapshot);
      const content = `<!--syllabai-whiteboard:preview\n${json}\n-->`;
      await onSave({
        title: title.trim() || "Whiteboard Note",
        content,
        color,
        ...(folderId ? { folderId } : {}),
      });
      toast.success("Whiteboard saved to Notes");
      setSnapshot(null);
      setTitle("Whiteboard Note");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to save whiteboard: " + (err?.message ?? "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[min(96vw,1200px)] w-full p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            New Whiteboard
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Draw, sketch, and diagram on an infinite grid. Saves as a Note so you can re-open and edit later.
          </p>
        </DialogHeader>
        <div className="px-5 pt-3 pb-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm w-56"
              placeholder="Whiteboard Note"
            />
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  className={`h-5 w-5 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {folders.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-muted-foreground">Folder</label>
              <select
                value={folderId ?? ""}
                onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="px-5 pb-3">
          <Whiteboard
            height={560}
            onSave={(snap) => setSnapshot(snap)}
          />
        </div>
        <DialogFooter className="px-5 py-4 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground mr-auto">
            Tip: press <kbd className="px-1.5 py-0.5 rounded border bg-background">P</kbd> for pen, <kbd className="px-1.5 py-0.5 rounded border bg-background">E</kbd> for eraser, <kbd className="px-1.5 py-0.5 rounded border bg-background">H</kbd> to pan, <kbd className="px-1.5 py-0.5 rounded border bg-background">Ctrl+Z</kbd> to undo.
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !snapshot} className="gap-1.5">
            <Brush className="w-4 h-4" />
            {saving ? "Saving..." : "Save as Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
