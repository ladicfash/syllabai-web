import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, BookOpen, Brain, Clock, Calendar,
  Mic, Compass, Timer, ListTodo, Users, Settings, Video,
  Database, Wand2, StickyNote, FlaskConical, Sun, Moon,
  Sparkles, Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type NavEntry = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Navigate" | "Actions";
  keywords?: string[];
};

const navEntries: NavEntry[] = [
  { path: "/dashboard",    label: "Dashboard",          icon: LayoutDashboard, group: "Navigate" },
  { path: "/explore",      label: "Explore",            icon: Compass,         group: "Navigate" },
  { path: "/collab",       label: "Collab Space",       icon: Users,           group: "Navigate" },
  { path: "/library",      label: "Library",            icon: BookOpen,        group: "Navigate" },
  { path: "/source-hub",   label: "Source Hub",         icon: Database,        group: "Navigate" },
  { path: "/study-tools",  label: "Study Studio",       icon: Wand2,           group: "Navigate" },
  { path: "/spaced-rep",   label: "Spaced Repetition",  icon: Zap,             group: "Navigate", keywords: ["srs", "flashcards", "review"] },
  { path: "/voice",        label: "Voice Notes",        icon: Mic,             group: "Navigate" },
  { path: "/video-notes",  label: "Video Notes",        icon: Video,           group: "Navigate" },
  { path: "/simulations",  label: "AI Simulations",     icon: FlaskConical,    group: "Navigate" },
  { path: "/notes",        label: "Notes",              icon: StickyNote,      group: "Navigate" },
  { path: "/planner",      label: "Planner",            icon: ListTodo,        group: "Navigate", keywords: ["calendar", "schedule"] },
  { path: "/timer",        label: "Study Timer",        icon: Timer,           group: "Navigate", keywords: ["pomodoro", "focus"] },
  { path: "/settings",     label: "Settings",           icon: Settings,        group: "Navigate" },
];

interface CommandPaletteProps {
  /** Optional explicit open state (otherwise uses internal state bound to ⌘K). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Global keyboard-shortcut command palette.
 *
 * Opens with ⌘K / Ctrl-K. Searchable jump-to-page navigation plus quick actions
 * (toggle theme). Designed for keyboard-first power users.
 */
export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (onOpenChange) onOpenChange(v);
      else setInternalOpen(v);
    },
    [onOpenChange],
  );

  // ⌘K / Ctrl-K opens the palette from anywhere.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const grouped = useMemo(() => {
    const groups: Record<string, NavEntry[]> = {};
    for (const entry of navEntries) {
      if (!groups[entry.group]) groups[entry.group] = [];
      groups[entry.group].push(entry);
    }
    return groups;
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate, setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(grouped).map(([group, entries]) => (
          <CommandGroup key={group} heading={group}>
            {entries.map((entry) => (
              <CommandItem
                key={entry.path}
                value={`${entry.label} ${entry.keywords?.join(" ") ?? ""}`}
                onSelect={() => go(entry.path)}
              >
                <entry.icon className="w-4 h-4 text-muted-foreground" />
                <span>{entry.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem value="toggle theme dark light mode" onSelect={() => { toggleTheme?.(); setOpen(false); }}>
            {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            <span>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem value="new study session spaced repetition flashcards" onSelect={() => go("/spaced-rep")}>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span>Start Spaced Repetition</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
          <CommandItem value="open study timer pomodoro focus" onSelect={() => go("/timer")}>
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Open Study Timer</span>
          </CommandItem>
          <CommandItem value="open calendar planner" onSelect={() => go("/planner")}>
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Open Planner</span>
          </CommandItem>
          <CommandItem value="open study studio generate materials" onSelect={() => go("/study-tools")}>
            <Brain className="w-4 h-4 text-muted-foreground" />
            <span>Open Study Studio</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}