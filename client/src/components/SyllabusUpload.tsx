import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, Calendar, BookOpen, AlertCircle, CheckCircle2, Loader2, X, GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deadline {
  title: string;
  date: string;
  type: "assignment" | "exam" | "reading" | "other";
  description: string;
  priority: "low" | "medium" | "high";
}

interface SyllabusUploadProps {
  onTasksCreated?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  assignment: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20",
  exam: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",
  reading: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  other: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export default function SyllabusUpload({ onTasksCreated }: SyllabusUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    courseName: string;
    instructor: string;
    deadlines: Deadline[];
    wordCount: number;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseSyllabus = trpc.ai.parseSyllabus.useMutation();
  const bulkCreate = trpc.tasks.bulkCreate.useMutation();

  const handleFile = useCallback(async (file: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB.");
      return;
    }

    setIsParsing(true);
    setIsDialogOpen(true);
    setParseResult(null);
    setSelectedIds(new Set());

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const base64 = btoa(Array.from(uint8, b => String.fromCharCode(b)).join(""));
      const result = await parseSyllabus.mutateAsync({
        fileBase64: base64,
        filename: file.name,
        mimeType: file.type,
      });
      setParseResult(result);
      // Select all by default
      setSelectedIds(new Set(result.deadlines.map((_: Deadline, i: number) => i)));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to parse syllabus. Please try again.");
      setIsDialogOpen(false);
    } finally {
      setIsParsing(false);
    }
  }, [parseSyllabus]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const toggleAll = () => {
    if (!parseResult) return;
    if (selectedIds.size === parseResult.deadlines.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parseResult.deadlines.map((_, i) => i)));
    }
  };

  const toggleItem = (idx: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleImport = async () => {
    if (!parseResult || selectedIds.size === 0) return;
    setIsCreating(true);
    try {
      const tasks = Array.from(selectedIds).map(i => {
        const d = parseResult.deadlines[i];
        return {
          title: d.title,
          description: d.description || undefined,
          dueDate: d.date || undefined,
          priority: d.priority as "low" | "medium" | "high",
          type: d.type as "assignment" | "exam" | "reading" | "other",
        };
      });
      const result = await bulkCreate.mutateAsync({ tasks });
      toast.success(`${result.count} deadline${result.count !== 1 ? "s" : ""} added to your planner.`);
      setIsDialogOpen(false);
      setParseResult(null);
      onTasksCreated?.();
    } catch {
      toast.error("Failed to create tasks. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8",
          "flex flex-col items-center justify-center gap-3 text-center",
          isDragging
            ? "border-primary bg-primary/8 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200",
          isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/15"
        )}>
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Upload your syllabus</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drop a PDF, DOCX, or TXT file — deadlines are extracted automatically
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {["PDF", "DOCX", "TXT"].map(fmt => (
            <span key={fmt} className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Results Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!isParsing && !isCreating) setIsDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-display">
              <GraduationCap className="w-5 h-5 text-primary" />
              Syllabus Import
            </DialogTitle>
            {parseResult && (
              <DialogDescription className="text-sm mt-1">
                <span className="font-medium text-foreground">{parseResult.courseName || "Course"}</span>
                {parseResult.instructor && (
                  <span className="text-muted-foreground"> · {parseResult.instructor}</span>
                )}
                <span className="text-muted-foreground"> · {parseResult.wordCount.toLocaleString()} words extracted</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Loading state */}
          {isParsing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Analyzing your syllabus</p>
                <p className="text-sm text-muted-foreground mt-1">Extracting deadlines and course information...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {!isParsing && parseResult && (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0 bg-muted/30">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.size === parseResult.deadlines.length}
                    onCheckedChange={toggleAll}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
                    {selectedIds.size === parseResult.deadlines.length ? "Deselect all" : "Select all"}
                  </label>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} of {parseResult.deadlines.length} selected
                </span>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="px-6 py-4 space-y-2">
                  {parseResult.deadlines.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">No deadlines found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        The AI could not detect any dated items in this document.
                      </p>
                    </div>
                  ) : (
                    parseResult.deadlines.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => toggleItem(i)}
                        className={cn(
                          "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150",
                          selectedIds.has(i)
                            ? "border-primary/30 bg-primary/5"
                            : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                        )}
                      >
                        <Checkbox
                          checked={selectedIds.has(i)}
                          onCheckedChange={() => toggleItem(i)}
                          onClick={e => e.stopPropagation()}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm leading-snug">{d.title}</p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize", TYPE_COLORS[d.type])}>
                                {d.type}
                              </span>
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", PRIORITY_COLORS[d.priority])}>
                                {d.priority}
                              </span>
                            </div>
                          </div>
                          {d.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{d.description}</p>
                          )}
                          {d.date && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-mono">{d.date}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0 bg-background">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isParsing || isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isParsing || isCreating || selectedIds.size === 0}
              className="gap-2"
            >
              {isCreating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding tasks...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Add {selectedIds.size} task{selectedIds.size !== 1 ? "s" : ""} to Planner</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
