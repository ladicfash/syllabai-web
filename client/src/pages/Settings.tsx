import { useState, useEffect } from "react";
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
  Mail, Phone, User, ChevronRight, Loader2, ShieldAlert
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";

interface Recipient {
  name: string;
  contact: string; // email or phone
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Fetch current settings
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  // Local form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [notifyFrequency, setNotifyFrequency] = useState<
    "every_hour" | "24_hours_before" | "as_approaching" | "every_few_days" | "disabled"
  >("as_approaching");
  const [shareDeadlinesEnabled, setShareDeadlinesEnabled] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientContact, setNewRecipientContact] = useState("");

  // Sync from server
  useEffect(() => {
    if (!settings) return;
    setDisplayName(settings.displayName ?? user?.name ?? "");
    setBio(settings.bio ?? "");
    setNotifyEnabled(settings.notifyEnabled ?? false);
    setNotificationEmail(settings.notificationEmail ?? "");
    setNotificationPhone(settings.notificationPhone ?? "");
    setNotifyFrequency((settings.notifyFrequency as typeof notifyFrequency) ?? "as_approaching");
    setShareDeadlinesEnabled(settings.shareDeadlinesEnabled ?? false);
    try {
      const parsed = settings.shareDeadlinesRecipients
        ? JSON.parse(settings.shareDeadlinesRecipients)
        : [];
      setRecipients(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecipients([]);
    }
  }, [settings, user]);

  const saveMutation = trpc.settings.save.useMutation({
    onSuccess: () => {
      toast.success("Settings saved.");
      utils.settings.get.invalidate();
    },
    onError: () => toast.error("Failed to save settings."),
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
      notificationPhone,
      notifyFrequency,
      shareDeadlinesEnabled,
      shareDeadlinesRecipients: JSON.stringify(recipients),
    });
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
          Manage your profile, notifications, and account.
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
            <label className="text-sm font-medium block mb-1.5">Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
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

      {/* ── Deadline Notifications ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Deadline Notifications</h2>
        </div>
        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Send deadline reminders</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receive reminders for upcoming assignments and exams
            </p>
          </div>
          <Switch
            checked={notifyEnabled}
            onCheckedChange={setNotifyEnabled}
          />
        </div>

        {notifyEnabled && (
          <div className="space-y-3 pl-1">
            <div>
              <label className="text-sm font-medium block mb-1.5">Reminder Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Reminder Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="tel"
                  value={notificationPhone}
                  onChange={(e) => setNotificationPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>

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
              Automatically forward your upcoming deadlines to selected contacts
            </p>
          </div>
          <Switch
            checked={shareDeadlinesEnabled}
            onCheckedChange={setShareDeadlinesEnabled}
          />
        </div>

        {shareDeadlinesEnabled && (
          <div className="space-y-3 pl-1">
            {/* Recipient list */}
            {recipients.length > 0 && (
              <div className="space-y-2">
                {recipients.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
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

            {/* Add recipient */}
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
            <p className="text-xs text-muted-foreground">
              Contacts will receive a summary of your upcoming deadlines at the same frequency as your notification setting above.
            </p>
          </div>
        )}
      </section>

      {/* ── Save Button ──────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="gap-2 min-w-32"
        >
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
              before permanent deletion. This action can be reversed by signing in again within that window.
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
                  You can reactivate by signing back in within that period.
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
