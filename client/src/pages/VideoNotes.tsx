import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Video, Square, Loader2, Trash2,
  Upload, Camera, RefreshCw, FileVideo, AlertTriangle, Brain, ChevronDown, ChevronUp, FileText, Sparkles,
  Scissors, Split, Plus, Save, Play, SkipForward, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MarkdownView } from "@/components/MarkdownView";
import { EmptyState } from "@/components/study/EmptyState";
import { AdSpace } from "@/components/AdSpace";

const MAX_VIDEOS = 20;
const MAX_FILE_SIZE_MB = 200;

type CaptureMode = "idle" | "camera" | "uploading" | "preview";
type VideoClip = { id: string; start: number; end: number; label: string };

type VideoEditorSource = {
  url: string;
  title: string;
  duration?: number;
};

function clampTime(value: number, duration: number) {
  return Math.max(0, Math.min(duration || 0, Number.isFinite(value) ? value : 0));
}

function formatPreciseTime(s: number) {
  const mins = Math.floor(s / 60).toString().padStart(2, "0");
  const secs = Math.floor(s % 60).toString().padStart(2, "0");
  const tenths = Math.floor((s % 1) * 10);
  return `${mins}:${secs}.${tenths}`;
}

function LiteVideoEditor({ source, onClose, onExport }: { source: VideoEditorSource; onClose: () => void; onExport: (blob: Blob, duration: number, title: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(source.duration || 0);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [markIn, setMarkIn] = useState(0);
  const [markOut, setMarkOut] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const selectedClip = clips.find((clip) => clip.id === selectedClipId) ?? clips[0];
  const totalDuration = clips.reduce((sum, clip) => sum + Math.max(0, clip.end - clip.start), 0);

  const initialize = () => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration || source.duration || 0;
    setDuration(d);
    setMarkIn(0);
    setMarkOut(d);
    if (clips.length === 0 && d > 0) {
      const first = { id: crypto.randomUUID(), start: 0, end: d, label: "Clip 1" };
      setClips([first]);
      setSelectedClipId(first.id);
    }
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = clampTime(time, duration);
  };

  const addClip = () => {
    const start = Math.min(markIn, markOut);
    const end = Math.max(markIn, markOut);
    if (end - start < 0.3) return toast.error("Clip must be at least 0.3 seconds long");
    const next = { id: crypto.randomUUID(), start, end, label: `Clip ${clips.length + 1}` };
    setClips((prev) => [...prev, next]);
    setSelectedClipId(next.id);
  };

  const trimSelected = () => {
    if (!selectedClip) return;
    const start = Math.min(markIn, markOut);
    const end = Math.max(markIn, markOut);
    if (end - start < 0.3) return toast.error("Trim range must be at least 0.3 seconds long");
    setClips((prev) => prev.map((clip) => clip.id === selectedClip.id ? { ...clip, start, end } : clip));
  };

  const splitSelected = () => {
    const video = videoRef.current;
    if (!selectedClip || !video) return;
    const t = clampTime(video.currentTime, duration);
    if (t <= selectedClip.start + 0.25 || t >= selectedClip.end - 0.25) return toast.error("Move playhead inside the clip to split");
    const left = { ...selectedClip, end: t, label: `${selectedClip.label} A` };
    const right = { id: crypto.randomUUID(), start: t, end: selectedClip.end, label: `${selectedClip.label} B` };
    setClips((prev) => prev.flatMap((clip) => clip.id === selectedClip.id ? [left, right] : [clip]));
    setSelectedClipId(right.id);
  };

  const moveClip = (id: string, direction: -1 | 1) => {
    setClips((prev) => {
      const idx = prev.findIndex((clip) => clip.id === id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id));
    if (selectedClipId === id) setSelectedClipId(null);
  };

  const previewTimeline = async () => {
    const video = videoRef.current;
    if (!video || clips.length === 0) return;
    setIsPreviewing(true);
    try {
      for (const clip of clips) {
        setSelectedClipId(clip.id);
        await new Promise<void>((resolve) => {
          const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = clip.start;
        });
        await video.play().catch(() => undefined);
        await new Promise<void>((resolve) => {
          const timer = window.setInterval(() => {
            if (video.currentTime >= clip.end || video.paused) {
              window.clearInterval(timer);
              video.pause();
              resolve();
            }
          }, 50);
        });
      }
    } finally {
      setIsPreviewing(false);
    }
  };

  const exportTimeline = async () => {
    if (!clips.length) return toast.error("Add at least one clip before exporting");
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    setExporting(true);
    setExportProgress(0);
    try {
      const video = document.createElement("video");
      video.src = source.url;
      video.crossOrigin = "anonymous";
      video.muted = false;
      video.playsInline = true;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not load source video for export"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas export is not supported in this browser");

      const canvasStream = canvas.captureStream(30);
      const tracks = [...canvasStream.getVideoTracks()];
      const captured = (video as any).captureStream?.();
      if (captured?.getAudioTracks) tracks.push(...captured.getAudioTracks());
      const stream = new MediaStream(tracks);
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
      recorder.start(250);

      let rendered = 0;
      const total = Math.max(0.1, totalDuration);
      for (const clip of clips) {
        await new Promise<void>((resolve) => {
          const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = clip.start;
        });
        await video.play().catch(() => undefined);
        await new Promise<void>((resolve) => {
          const draw = () => {
            try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); } catch {}
            const clipProgress = Math.min(Math.max(video.currentTime - clip.start, 0), clip.end - clip.start);
            setExportProgress(Math.min(100, Math.round(((rendered + clipProgress) / total) * 100)));
            if (video.currentTime >= clip.end || video.ended) {
              video.pause();
              rendered += clip.end - clip.start;
              resolve();
            } else requestAnimationFrame(draw);
          };
          requestAnimationFrame(draw);
        });
      }
      recorder.stop();
      const blob = await new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });
      onExport(blob, totalDuration, `${source.title.replace(/\.[^.]+$/, "")}_edited`);
      toast.success("Edited video rendered. Review it, then save as a new video note.");
    } catch (err: any) {
      toast.error(err.message || "Export failed. Try a local/uploaded video if this source blocks browser editing.");
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 md:p-6">
      <div className="mx-auto max-w-6xl rounded-3xl border bg-card shadow-2xl overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Scissors className="w-3.5 h-3.5" /> Lite Video Editor
            </div>
            <h2 className="text-xl font-bold">{source.title}</h2>
            <p className="text-xs text-muted-foreground">Non-destructive timeline: trim, split, reorder, delete clips, then render a new note.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={exportTimeline} disabled={exporting || clips.length === 0} className="gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {exporting ? `Rendering ${exportProgress}%` : "Render Edit"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <video ref={videoRef} src={source.url} crossOrigin="anonymous" controls playsInline onLoadedMetadata={initialize} className="h-full w-full object-contain" />
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">Mark In <span className="text-xs text-muted-foreground">{formatPreciseTime(markIn)}</span>
                  <input aria-label="Mark in time" type="range" min={0} max={duration || 0} step={0.1} value={markIn} onChange={(e) => { const v = Number(e.target.value); setMarkIn(v); seek(v); }} className="w-full" />
                </label>
                <label className="space-y-1 text-sm font-medium">Mark Out <span className="text-xs text-muted-foreground">{formatPreciseTime(markOut)}</span>
                  <input aria-label="Mark out time" type="range" min={0} max={duration || 0} step={0.1} value={markOut} onChange={(e) => { const v = Number(e.target.value); setMarkOut(v); seek(v); }} className="w-full" />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { const t = videoRef.current?.currentTime ?? 0; setMarkIn(t); }} className="gap-1.5"><Scissors className="w-3.5 h-3.5" /> Set In</Button>
                <Button variant="outline" size="sm" onClick={() => { const t = videoRef.current?.currentTime ?? 0; setMarkOut(t); }} className="gap-1.5"><Scissors className="w-3.5 h-3.5" /> Set Out</Button>
                <Button variant="outline" size="sm" onClick={trimSelected} className="gap-1.5"><Scissors className="w-3.5 h-3.5" /> Trim Selected</Button>
                <Button variant="outline" size="sm" onClick={addClip} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Clip</Button>
                <Button variant="outline" size="sm" onClick={splitSelected} className="gap-1.5"><Split className="w-3.5 h-3.5" /> Split</Button>
                <Button size="sm" onClick={previewTimeline} disabled={isPreviewing || !clips.length} className="gap-1.5"><Play className="w-3.5 h-3.5" /> Preview Timeline</Button>
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">Timeline</p>
                <p className="text-xs text-muted-foreground">{clips.length} clips · {formatPreciseTime(totalDuration)}</p>
              </div>
              <div className="flex min-h-16 gap-2 overflow-x-auto rounded-xl bg-muted/30 p-3">
                {clips.map((clip, index) => {
                  const active = clip.id === selectedClip?.id;
                  const width = Math.max(88, ((clip.end - clip.start) / Math.max(totalDuration, 1)) * 520) || 88;
                  return (
                    <button key={clip.id} onClick={() => { setSelectedClipId(clip.id); seek(clip.start); }} style={{ width }} className={cn("shrink-0 rounded-xl border p-3 text-left transition-all", active ? "border-primary bg-primary/10 ring-2 ring-primary/15" : "bg-card hover:bg-muted")}>
                      <p className="text-xs font-semibold">{index + 1}. {clip.label}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatPreciseTime(clip.start)} → {formatPreciseTime(clip.end)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border bg-card p-4">
              <p className="font-semibold mb-2">Edit decision list</p>
              <p className="text-xs text-muted-foreground mb-3">The editor uses an EDL-style algorithm: edits are saved as clip ranges, then rendered in order.</p>
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {clips.map((clip, index) => (
                  <div key={clip.id} className={cn("rounded-xl border p-3", clip.id === selectedClip?.id && "border-primary bg-primary/5")}>
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => { setSelectedClipId(clip.id); seek(clip.start); }} className="text-left">
                        <p className="text-sm font-medium">{clip.label}</p>
                        <p className="text-xs text-muted-foreground">{formatPreciseTime(clip.start)}–{formatPreciseTime(clip.end)} · {formatPreciseTime(clip.end - clip.start)}</p>
                      </button>
                      <div className="flex gap-1">
                        <button aria-label="Move clip up" onClick={() => moveClip(clip.id, -1)} disabled={index === 0} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                        <button aria-label="Move clip down" onClick={() => moveClip(clip.id, 1)} disabled={index === clips.length - 1} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                        <button aria-label="Delete clip" onClick={() => removeClip(clip.id)} className="rounded p-1 hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {clips.length === 0 && <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No clips yet. Add a clip from the current in/out range.</div>}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Browser editing note</p>
              <p>Local/uploaded videos export best. Remote videos may block canvas rendering depending on CORS. Audio is included when the browser supports video capture streams.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function VideoNotes() {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState("video/webm");
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState<number | null>(null);
  const [convertingFlash, setConvertingFlash] = useState<number | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState("Video Note");
  const [aiOutputByNote, setAiOutputByNote] = useState<Record<number, { title: string; content: string }>>({});
  const [editorSource, setEditorSource] = useState<VideoEditorSource | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const utils = trpc.useUtils();

  const uploadMut = trpc.videoNotes.upload.useMutation({
    onSuccess: () => {
      utils.videoNotes.list.invalidate();
      toast.success("Video note saved!");
      resetCapture();
    },
    onError: (err) => toast.error("Upload failed: " + err.message),
  });

  const deleteMut = trpc.videoNotes.delete.useMutation({
    onSuccess: () => { utils.videoNotes.list.invalidate(); toast.success("Video deleted"); },
    onError: (err) => toast.error("Delete failed: " + err.message),
  });

  const transcribeMut = trpc.videoNotes.transcribe.useMutation({
    onSuccess: () => {
      utils.videoNotes.list.invalidate();
      toast.success("Transcription complete!");
      setTranscribing(null);
    },
    onError: (err) => { toast.error("Transcription failed: " + err.message); setTranscribing(null); },
  });

  const convertToFlashMut = trpc.ai.generateFlashcards.useMutation({
    onSuccess: () => { utils.decks.list.invalidate(); toast.success("Flashcards created!"); },
    onError: (err) => toast.error("Flashcard creation failed: " + (err.message ?? "Unknown error")),
  });
  // Dedicated video-note AI generator (new videoNotes.generateNotes endpoint).
  // The backend always returns useful output, even if the AI service is briefly unreachable.
  const generateVideoNotesMut = trpc.videoNotes.generateNotes.useMutation({
    onSuccess: (data, vars: any) => {
      const labels = { summary: "Summary", cornell: "Cornell Notes", key_points: "Key Points" } as const;
      const label = labels[data.mode as keyof typeof labels] ?? "AI Notes";
      setAiOutputByNote((prev) => ({ ...prev, [vars.noteId]: { title: label, content: data.content } }));
      toast.success(`${label} generated!`);
    },
    onError: (err) => toast.error("AI generation failed: " + (err.message ?? "Unknown error")),
  });

  const { data: videoNotes, isLoading: notesLoading } = trpc.videoNotes.list.useQuery();
  const videoCount = videoNotes?.length ?? 0;

  const resetCapture = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    setNoteTitle("Video Note");
    setCaptureMode("idle");
    setIsRecording(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setCaptureMode("camera");
    } catch (err: any) {
      toast.error("Camera access denied: " + (err.message ?? ""));
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  };

  const startCameraRecording = () => {
    if (!streamRef.current) return;
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";
    setVideoMimeType(mimeType.split(";")[0]);
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const baseMime = mimeType.split(";")[0];
      const blob = new Blob(chunksRef.current, { type: baseMime });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      setVideoMimeType(baseMime);
      stopCamera();
      setCaptureMode("preview");
    };
    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
    durationRef.current = 0;
    setDuration(0);
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setDuration(durationRef.current);
    }, 1000);
  };

  const stopCameraRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setVideoBlob(file);
    setVideoUrl(URL.createObjectURL(file));
    setVideoMimeType(file.type || "video/mp4");
    setNoteTitle(file.name.replace(/\.[^.]+$/, ""));
    setCaptureMode("preview");
  };

  const handleUpload = async () => {
    if (!videoBlob) return;
    if (videoCount >= MAX_VIDEOS) {
      toast.error(`Video limit reached (${MAX_VIDEOS} maximum). Delete some videos first.`);
      return;
    }
    setUploading(true);
    try {
      const uint8 = new Uint8Array(await videoBlob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      const base64 = btoa(binary);
      await uploadMut.mutateAsync({
        videoData: base64,
        mimeType: videoMimeType,
        title: noteTitle,
        duration: durationRef.current,
      });
    } catch (err: any) {
      toast.error("Upload failed: " + (err.message ?? "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleTranscribe = async (note: { id: number; s3Url: string }) => {
    setTranscribing(note.id);
    await transcribeMut.mutateAsync({ id: note.id, audioUrl: note.s3Url });
  };

  const handleConvertToFlash = async (note: { id: number; transcript: string | null }) => {
    if (!note.transcript) return;
    setConvertingFlash(note.id);
    try {
      await convertToFlashMut.mutateAsync({ documentId: 0, text: note.transcript.slice(0, 7500), difficulty: "intermediate", style: "application" });
    } finally {
      setConvertingFlash(null);
    }
  };

  const handleTranscriptAI = (note: { id: number; transcript: string | null }, mode: "summary" | "cornell" | "key_points") => {
    if (!note.transcript) {
      toast.error("Transcribe this video first to generate notes.");
      return;
    }
    generateVideoNotesMut.mutate({ id: note.id, mode, text: note.transcript.slice(0, 12000) });
  };

  const handleEditorExport = (blob: Blob, editedDuration: number, editedTitle: string) => {
    setVideoBlob(blob);
    setVideoUrl(URL.createObjectURL(blob));
    setVideoMimeType(blob.type || "video/webm");
    setNoteTitle(editedTitle);
    setDuration(Math.round(editedDuration));
    durationRef.current = Math.round(editedDuration);
    setCaptureMode("preview");
    setEditorSource(null);
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="mobile-page p-6 max-w-4xl mx-auto space-y-6">
      {editorSource && (
        <LiteVideoEditor source={editorSource} onClose={() => setEditorSource(null)} onExport={handleEditorExport} />
      )}

      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold font-serif">Video Notes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Record or upload video notes — up to {MAX_VIDEOS} videos, {MAX_FILE_SIZE_MB}MB each
        </p>
      </div>

      {/* Storage cap warning */}
      {videoCount >= MAX_VIDEOS && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Storage limit reached ({MAX_VIDEOS}/{MAX_VIDEOS} videos). Delete existing videos to add new ones.</span>
        </div>
      )}
      {videoCount > 0 && videoCount < MAX_VIDEOS && (
        <p className="text-xs text-muted-foreground">{videoCount}/{MAX_VIDEOS} videos used</p>
      )}

      {/* Capture Panel */}
      {captureMode === "idle" && (
        <div className="study-card p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Add a Video Note</h3>
              <p className="text-sm text-muted-foreground mt-1">Record from your camera or upload a video file</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                variant="outline"
                onClick={startCamera}
                disabled={videoCount >= MAX_VIDEOS}
                className="gap-2"
              >
                <Camera className="w-4 h-4" /> Record from Camera
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={videoCount >= MAX_VIDEOS}
                className="gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Video File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Camera View */}
      {captureMode === "camera" && (
        <div className="study-card p-6 space-y-4 animate-fade-in">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                REC {formatDuration(duration)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 justify-center">
            {!isRecording ? (
              <>
                <Button onClick={startCameraRecording} className="gap-2 bg-red-500 hover:bg-red-600">
                  <Video className="w-4 h-4" /> Start Recording
                </Button>
                <Button variant="outline" onClick={() => { stopCamera(); setCaptureMode("idle"); }}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={stopCameraRecording} className="gap-2 bg-red-700 hover:bg-red-800">
                <Square className="w-4 h-4" /> Stop Recording
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preview & Save */}
      {captureMode === "preview" && videoUrl && (
        <div className="study-card p-6 space-y-4 animate-slide-up">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Note title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Give this video a title..."
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleUpload}
              disabled={uploading || videoCount >= MAX_VIDEOS}
              className="gap-2 flex-1"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Save Video Note"}
            </Button>
            <Button variant="outline" onClick={() => videoUrl && setEditorSource({ url: videoUrl, title: noteTitle, duration })} className="gap-2">
              <Scissors className="w-4 h-4" /> Edit
            </Button>
            <Button variant="outline" onClick={resetCapture} className="gap-2">
              <Trash2 className="w-4 h-4" /> Discard
            </Button>
          </div>
        </div>
      )}

      {/* Ad space - between capture controls and saved videos */}
      <div className="flex justify-center">
        <AdSpace format="banner-468x60" />
      </div>

      {/* Saved Videos List */}
      <div className="space-y-3 animate-fade-in">
        <h2 className="text-lg font-semibold">Saved Video Notes</h2>
        {notesLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="study-card p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : !videoNotes?.length ? (
          <EmptyState
            icon={Video}
            title="No video notes yet"
            description="Record from your camera or upload a lecture clip, then transcribe it into summaries, Cornell notes, and flashcards."
          />
        ) : (
          <div className="space-y-3">
            {videoNotes.map((note) => (
              <div key={note.id} className="study-card overflow-hidden">
                {/* Note header row */}
                <div className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileVideo className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDuration(note.duration)} · {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </p>
                    {note.transcript && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {note.transcript}
                      </p>
                    )}
                    {!note.transcript && (
                      <p className="text-xs text-muted-foreground/50 mt-1 italic">No transcript yet</p>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Expand/collapse video player */}
                    <button
                      onClick={() => setExpandedVideoId(expandedVideoId === note.id ? null : note.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      title={expandedVideoId === note.id ? "Hide video" : "Play video"}
                    >
                      {expandedVideoId === note.id
                        ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => setEditorSource({ url: note.s3Url, title: note.title, duration: note.duration })}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                      title="Open lite video editor"
                    >
                      <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    {/* Transcribe */}
                    {!note.transcript && (
                      <button
                        onClick={() => handleTranscribe(note)}
                        disabled={transcribing === note.id}
                        className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                        title="Transcribe with Whisper"
                      >
                        {transcribing === note.id
                          ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                          : <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                    )}
                    {/* Transcript AI actions */}
                    {note.transcript && (
                      <>
                        <button onClick={() => handleTranscriptAI(note, "summary")} disabled={generateVideoNotesMut.isPending} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Summarize transcript">
                          {generateVideoNotesMut.isPending ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => handleTranscriptAI(note, "cornell")} disabled={generateVideoNotesMut.isPending} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Create Cornell notes">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleConvertToFlash(note)}
                          disabled={convertingFlash === note.id}
                          className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                          title="Convert transcript to flashcards"
                        >
                          {convertingFlash === note.id
                            ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                            : <Brain className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                      </>
                    )}
                    {/* Delete */}
                    <button
                      onClick={() => {
                        deleteMut.mutate({ id: note.id });
                        if (expandedVideoId === note.id) setExpandedVideoId(null);
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Inline video player (expanded) */}
                {expandedVideoId === note.id && (
                  <div className="border-t border-border bg-black">
                    <video
                      src={note.s3Url}
                      controls
                      playsInline
                      autoPlay
                      className="w-full max-h-80 object-contain"
                      onError={() => toast.error("Could not load video. The file may have expired or been removed.")}
                    />
                  </div>
                )}
                {aiOutputByNote[note.id] && (
                  <div className="border-t border-border p-4 bg-muted/20">
                    <h4 className="font-semibold text-sm mb-2">{aiOutputByNote[note.id].title}</h4>
                    <div className="streamdown-content text-sm"><MarkdownView>{aiOutputByNote[note.id].content}</MarkdownView></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
