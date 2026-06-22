import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Mic, MicOff, Square, Play, Pause, Sparkles, Brain, Loader2, Trash2, FileAudio, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

type RecordingState = "idle" | "recording" | "processing";

export default function VoiceNotes() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [convertingToFlash, setConvertingToFlash] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);

  const utils = trpc.useUtils();
  const uploadAudioMut = trpc.voice.uploadAudio.useMutation();
  const transcribeMut = trpc.voice.transcribe.useMutation();
  const convertToFlashMut = trpc.ai.generateFlashcards.useMutation({
    onSuccess: () => { utils.decks.list.invalidate(); toast.success("Flashcards created from voice note!"); },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingState("processing");
        // Transcribe
        try {
          const uint8 = new Uint8Array(await blob.arrayBuffer());
          let binary = "";
          for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
          const base64 = btoa(binary);
          const { url } = await uploadAudioMut.mutateAsync({ audioData: base64, mimeType: "audio/webm" });
          const result = await transcribeMut.mutateAsync({ audioUrl: url });
          setTranscript(result.text);
          toast.success("Transcription complete!");
        } catch (err: any) {
          toast.error("Transcription failed: " + (err.message ?? "Unknown error"));
        }
        setRecordingState("idle");
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setRecordingState("recording");
      durationRef.current = 0;
      setDuration(0);
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } catch (err: any) {
      toast.error("Microphone access denied: " + (err.message ?? ""));
    }
  }, [transcribeMut]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const convertToFlashcards = async () => {
    if (!transcript.trim()) return;
    setConvertingToFlash(true);
    try {
      // Use documentId=0 as a sentinel for voice-note-based flashcards
      await convertToFlashMut.mutateAsync({ documentId: 0, text: transcript.slice(0, 7500) });
    } finally {
      setConvertingToFlash(false);
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold font-serif">Voice Notes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Record, transcribe, and convert to flashcards with Whisper AI</p>
      </div>

      {/* Recorder */}
      <div className="study-card p-8 flex flex-col items-center gap-6 animate-fade-in">
        {/* Waveform Visual */}
        <div className={cn("flex items-center gap-1 h-12", recordingState !== "recording" && "opacity-30")}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn("w-1.5 rounded-full bg-primary transition-all", recordingState === "recording" ? "animate-bounce" : "h-2")}
              style={recordingState === "recording" ? {
                height: `${Math.random() * 32 + 8}px`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              } : { height: "8px" }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-4xl font-mono font-bold tracking-widest">{formatDuration(duration)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {recordingState === "recording" ? "Recording..." : recordingState === "processing" ? "Transcribing..." : "Ready to record"}
          </p>
        </div>

        {/* Record Button */}
        <div className="flex items-center gap-4">
          {recordingState === "idle" && (
            <Button
              size="icon"
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
            >
              <Mic className="w-7 h-7" />
            </Button>
          )}
          {recordingState === "recording" && (
            <Button
              size="icon"
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 animate-pulse-glow"
            >
              <Square className="w-6 h-6" />
            </Button>
          )}
          {recordingState === "processing" && (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Playback */}
        {audioUrl && recordingState === "idle" && (
          <div className="flex items-center gap-3 w-full max-w-xs">
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
            <Button variant="outline" size="sm" onClick={togglePlay} className="gap-1.5">
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? "Pause" : "Play Recording"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setAudioBlob(null); setAudioUrl(null); setTranscript(""); setDuration(0); }} className="gap-1.5 text-muted-foreground">
              <Trash2 className="w-3.5 h-3.5" /> Discard
            </Button>
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="study-card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-primary" /> Transcript
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={convertToFlashcards}
                disabled={convertingToFlash}
                className="gap-1.5"
              >
                {convertingToFlash ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                Convert to Flashcards
              </Button>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>
          <p className="text-xs text-muted-foreground">{transcript.split(" ").length} words · Transcribed with Whisper AI</p>
        </div>
      )}

      {/* Tips */}
      {!transcript && recordingState === "idle" && !audioUrl && (
        <div className="study-card p-5 animate-fade-in">
          <h3 className="font-semibold text-sm mb-3">Tips for best results</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Speak clearly and at a moderate pace</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Record in a quiet environment for best transcription accuracy</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> After transcription, convert directly to flashcards for instant study materials</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Works great for summarizing lectures, book chapters, or study sessions</li>
          </ul>
        </div>
      )}
    </div>
  );
}
