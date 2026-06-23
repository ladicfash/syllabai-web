import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bell, Share2, UserX, Save, Plus, Trash2,
  Mail, User, Loader2, ShieldAlert, Palette, Info,
  Smartphone, CheckCircle2, XCircle,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface Recipient {
  name: string;
  contact: string;
}

const ACCENT_PRESETS: (string | null)[] = [
  null,
  "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#e11d48",
  "#a16207", "#0e7490", "#7c3aed", "#be185d", "#065f46",
];

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notifyFrequency, setNotifyFrequency] = useState<
    "every_hour" | "24_hours_before" | "as_approaching" | "every_few_days" | "disabled"
  >("as_approaching");
  const [shareDeadlinesEnabled, setShareDeadlinesEnabled] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientContact, setNewRecipientContact] = useState("");
  const [accentColor, setAccentColor] = useState<string | null>(null);

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setDisplayName(settings.displayName ?? user?.name ?? "");
    setBio(settings.bio ?? "");
    setNotifyEnabled(settings.notifyEnabled ?? false);
    setNotificationEmail(settings.notificationEmail ?? "");
    setNotifyFrequency((settings.notifyFrequency as typeof notifyFrequency) ?? "as_approaching");
    setShareDeadlinesEnabled(settings.shareDeadlinesEnabled ?? false);
    setAccentColor((settings as any).accentColor ?? null);
    try {
      const parsed = settings.shareDeadlinesRecipients
        ? JSON.parse(settings.shareDeadlinesRecipients)
        : [];
      setRecipients(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecipients([]);
    }
  }, [settings, user]);

  // Check push support and current subscription status
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && !!VAPID_PUBLIC_KEY;
    setPushSupported(supported);
    if (supported) {
      setPushPermission(Notification.permission);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribePushMutation = trpc.settings.subscribePush.useMutation();
  const unsubscribePushMutation = trpc.settings.unsubscribePush.useMutation();

  const handleTogglePush = useCallback(async () => {
    if (!pushSupported) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushSubscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await unsubscribePushMutation.mutateAsync({ endpoint: sub.endpoint });
        }
        setPushSubscribed(false);
        toast.success("Push notifications disabled.");
      } else {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission !== "granted") {
          toast.error("Notification permission denied. Please allow notifications in your browser settings.");
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        await subscribePushMutation.mutateAsync({
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        });
        setPushSubscribed(true);
        toast.success("Push notifications enabled! You'll get deadline reminders on this device.");
      }
    } catch (err) {
      console.error("Push toggle error:", err);
      toast.error("Failed to update push notification settings.");
    } finally {
      setPushLoading(false);
    }
  }, [pushSupported, pushSubscribed, subscribePushMutation, unsubscribePushMutation]);

  const saveMutation = trpc.settings.save.useMutation({
    onSuccess: () => {
      toast.success("Settings saved.");
      utils.settings.get.invalidate();
    },
    onError: () => toast.error("Failed to save settings."),
  });

  const sendTestMutation = trpc.settings.sendDeadlineNotifications.useMutation({
    onSuccess: (data) => {
      if (data.sent > 0) toast.success(`Sent ${data.sent} notification(s) successfully.`);
      else toast.info("No upcoming deadlines in the next 3 days to notify about.");
    },
    onError: () => toast.error("Failed to send test notification."),
  });

  const deactivateMutation = trpc.settings.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Account deactivated. You have been signed out.");
      logout();
      setLocation("/");
    },
    onError: () => toast.error("Failed to deactivate account."),
  });

  const handleSave = () => {
    saveMutation.mutate({
      displayName,
      bio,
      notifyEnabled,
      notificationEmail,
      notifyFrequency,
      shareDeadlinesEnabled,
      shareDeadlinesRecipients: JSON.stringify(recipients),
      accentColor: accentColor ?? null,
    } as any);
  };

  const addRecipient = () => {
    if (!newRecipientName.trim() || !newRecipientContact.trim()) return;
    setRecipients((prev) => [...prev, { name: newRecipientName.trim(), contact: newRecipientContact.trim() }]);
    setNewRecipientName("");
    setNewRecipientContact("");
  };

  const removeRecipient = (i: number) => {
    setRecipients((prev) => prev.filter((_, idx) => idx !== i));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile, appearance, notifications, and account.
        </p>
      </div>

      {/* ── Profile ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Profile</h2>
        </div>
        <Separator />
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.name ?? "Your name"}
              maxLength={128}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Bio <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio visible on your public profile"
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Account Email</label>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* ── Appearance ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Appearance</h2>
        </div>
        <Separator />
        <div>
          <label className="text-sm font-medium block mb-1.5">Accent Colour</label>
          <p className="text-xs text-muted-foreground mb-3">
            Personalise buttons, links, and highlights. Leave blank to use the theme default
            (gold in light mode, blue in dark mode).
          </p>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c ?? "default"}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  title={c ?? "Theme default"}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary",
                    accentColor === c ? "border-foreground scale-110 shadow-md" : "border-transparent"
                  )}
                  style={
                    c
                      ? { backgroundColor: c }
                      : { background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }
                  }
                />
              ))}
              <input
                type="color"
                value={accentColor ?? "#f59e0b"}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border border-border bg-transparent p-0"
                title="Pick any colour"
              />
            </div>
            {accentColor && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-border shadow-sm" style={{ backgroundColor: accentColor }} />
                <span className="text-sm font-mono text-muted-foreground">{accentColor}</span>
                <button
                  onClick={() => setAccentColor(null)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Reset to default
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Deadline Notifications ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Deadline Notifications</h2>
        </div>
        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable deadline reminders</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get notified about upcoming assignments and exams
            </p>
          </div>
          <Switch checked={notifyEnabled} onCheckedChange={setNotifyEnabled} />
        </div>

        {notifyEnabled && (
          <div className="space-y-5 pl-1">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Reminders
              </label>
              <Input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Powered by Brevo — up to 300 emails/day, free forever.
              </p>
            </div>

            {/* Browser Push */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Browser / Device Push Notifications
              </label>

              {!pushSupported ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Push notifications are not supported in this browser. Try Chrome or Edge on desktop.
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-3">
                    {pushSubscribed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {pushSubscribed ? "This device is subscribed" : "This device is not subscribed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pushPermission === "denied"
                          ? "Notifications blocked — allow them in browser settings first"
                          : "Receive native OS notifications even when the tab is in the background"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={pushSubscribed ? "outline" : "default"}
                    onClick={handleTogglePush}
                    disabled={pushLoading || pushPermission === "denied"}
                    className="shrink-0"
                  >
                    {pushLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : pushSubscribed ? (
                      "Disable"
                    ) : (
                      "Enable"
                    )}
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                SMS reminders — <span className="font-medium">coming soon</span>. Enable push notifications above for instant device alerts in the meantime.
              </p>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Reminder Frequency</label>
              <Select
                value={notifyFrequency}
                onValueChange={(v) => setNotifyFrequency(v as typeof notifyFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="every_hour">Every hour (while deadline is today)</SelectItem>
                  <SelectItem value="24_hours_before">24 hours before deadline</SelectItem>
                  <SelectItem value="as_approaching">As deadlines approach (3 days, 1 day, day-of)</SelectItem>
                  <SelectItem value="every_few_days">Every few days</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test button */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestMutation.mutate()}
                disabled={sendTestMutation.isPending}
                className="gap-2"
              >
                {sendTestMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                Send Test Reminder Now
              </Button>
              <p className="text-xs text-muted-foreground">
                Sends a reminder for any tasks due in the next 3 days.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Share Deadlines ──────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Share Deadlines</h2>
        </div>
        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Send deadlines to a friend or classmate</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Forward your upcoming deadlines to selected contacts
            </p>
          </div>
          <Switch checked={shareDeadlinesEnabled} onCheckedChange={setShareDeadlinesEnabled} />
        </div>

        {shareDeadlinesEnabled && (
          <div className="space-y-3 pl-1">
            {recipients.length > 0 && (
              <div className="space-y-2">
                {recipients.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-muted-foreground ml-2">{r.contact}</span>
                    </div>
                    <button
                      onClick={() => removeRecipient(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Name"
                className="flex-1"
              />
              <Input
                value={newRecipientContact}
                onChange={(e) => setNewRecipientContact(e.target.value)}
                placeholder="Email or phone"
                className="flex-[2]"
                onKeyDown={(e) => e.key === "Enter" && addRecipient()}
              />
              <Button size="icon" variant="outline" onClick={addRecipient}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── Save Button ──────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2 min-w-32">
          {saveMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Settings</>
          )}
        </Button>
      </div>

      {/* ── Account ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Account</h2>
        </div>
        <Separator />
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-destructive">Deactivate Account</p>
            <p className="text-xs text-muted-foreground mt-1">
              Deactivating your account will sign you out immediately. Your data will be retained for 30 days
              before permanent deletion.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <UserX className="w-4 h-4" />
                Deactivate Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out immediately. Your account and data will be scheduled for deletion in 30 days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deactivateMutation.mutate()}
                  disabled={deactivateMutation.isPending}
                >
                  {deactivateMutation.isPending ? "Deactivating..." : "Yes, deactivate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

    </div>
  );
}
