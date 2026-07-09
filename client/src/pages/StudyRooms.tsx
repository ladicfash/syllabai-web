import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Video, Plus, Copy, Users, ArrowLeft, Clock, Loader2, ScreenShare } from "lucide-react";
import { cn } from "@/lib/utils";

const CALL_DURATION_MINUTES = 30;
const JITSI_DOMAIN = "meet.jit.si";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

/** Loads the Jitsi external API script once, reused across mounts. */
function useJitsiScript() {
  const [ready, setReady] = useState(!!window.JitsiMeetExternalAPI);

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setReady(true);
      return;
    }
    const SCRIPT_ID = "jitsi-external-api";
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => toast.error("Couldn't load the video call service. Check your connection and try again.");
    document.head.appendChild(script);
  }, []);

  return ready;
}

function formatTimeLeft(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CallRoom({ roomCode, topic }: { roomCode: string; topic: string }) {
  const jitsiReady = useJitsiScript();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [, setLocation] = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(CALL_DURATION_MINUTES * 60);
  const [ended, setEnded] = useState(false);

  const endCall = useCallback(() => {
    apiRef.current?.executeCommand?.("hangup");
    setEnded(true);
  }, []);

  const toggleScreenShare = useCallback(() => {
    apiRef.current?.executeCommand?.("toggleShareScreen");
  }, []);

  useEffect(() => {
    if (!jitsiReady || !containerRef.current || apiRef.current) return;

    apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName: `syllabai-${roomCode}`,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: {
        startWithVideoMuted: false,
        prejoinPageEnabled: true,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        MOBILE_APP_PROMO: false,
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "desktop", "fullscreen", "chat",
          "settings", "raisehand", "tileview", "hangup",
        ],
      },
    });

    apiRef.current.addEventListener("videoConferenceLeft", () => setEnded(true));

    return () => {
      apiRef.current?.dispose?.();
      apiRef.current = null;
    };
  }, [jitsiReady, roomCode]);

  // 30-minute hard cutoff
  useEffect(() => {
    if (ended) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endCall();
          toast.info("Study session ended — 30 minute limit reached.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ended, endCall]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/study-rooms/${roomCode}`);
    toast.success("Invite link copied — send it to your study partner.");
  };

  if (ended) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full py-24">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold">Session ended</p>
          <p className="text-sm text-muted-foreground">Your study room call has finished.</p>
        </div>
        <Button onClick={() => setLocation("/study-rooms")}>Back to Study Rooms</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/60">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setLocation("/study-rooms")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <p className="text-sm font-medium truncate">{topic}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={toggleScreenShare}>
            <ScreenShare className="w-3.5 h-3.5" /> Share screen
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={copyLink}>
            <Copy className="w-3.5 h-3.5" /> Copy invite
          </Button>
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-md",
              secondsLeft <= 60 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTimeLeft(secondsLeft)}
          </div>
        </div>
      </div>
      <div className="flex-1 relative bg-black">
        {!jitsiReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

function RoomList() {
  const [topic, setTopic] = useState("");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: rooms, isLoading } = trpc.studyRooms.listMine.useQuery();
  const createRoom = trpc.studyRooms.create.useMutation({
    onSuccess: (data) => {
      utils.studyRooms.listMine.invalidate();
      setLocation(`/study-rooms/${data.roomCode}`);
    },
    onError: () => toast.error("Couldn't create the study room. Try again."),
  });

  const handleCreate = () => {
    const trimmed = topic.trim();
    if (!trimmed) {
      toast.error("Give your study session a topic first.");
      return;
    }
    createRoom.mutate({ topic: trimmed });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" /> Study Rooms
        </h1>
        <p className="text-sm text-muted-foreground">
          Start a free video call with your study group — screen sharing included. Sessions are capped at {CALL_DURATION_MINUTES} minutes.
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Start a new session</p>
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Bio 201 midterm review"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={createRoom.isPending} className="gap-1.5 shrink-0">
            {createRoom.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Start
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Your recent rooms</p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : !rooms?.length ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Users className="w-8 h-8 opacity-40" />
            <p className="text-sm">No study rooms yet — start one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <Link key={room.id} href={`/study-rooms/${room.roomCode}`}>
                <Card className="p-3 flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{room.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(room.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudyRooms() {
  const [matchRoom, roomParams] = useRoute("/study-rooms/:roomCode");
  const roomCode = roomParams?.roomCode;
  const { data: room, isLoading, isError } = trpc.studyRooms.getByCode.useQuery(
    { roomCode: roomCode ?? "" },
    { enabled: !!roomCode }
  );

  if (!matchRoom) {
    return <RoomList />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full py-24 text-center">
        <p className="font-medium">Room not found</p>
        <p className="text-sm text-muted-foreground">This study room link may have expired or is invalid.</p>
        <Link href="/study-rooms">
          <Button variant="outline">Back to Study Rooms</Button>
        </Link>
      </div>
    );
  }

  return <CallRoom roomCode={room.roomCode} topic={room.topic} />;
}
