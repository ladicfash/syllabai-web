import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Brain, Clock, Calendar, Zap, FileText, Target,
  ArrowRight, TrendingUp, Flame, Star, Plus, Upload
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const quickActions = [
  { label: "Upload Document", icon: Upload, path: "/library", color: "bg-blue-500" },
  { label: "Study Flashcards", icon: Brain, path: "/study-tools", color: "bg-violet-500" },
  { label: "Start Timer", icon: Clock, path: "/timer", color: "bg-amber-500" },
  { label: "View Planner", icon: Calendar, path: "/planner", color: "bg-emerald-500" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: docs, isLoading: docsLoading } = trpc.documents.list.useQuery();
  const { data: decks, isLoading: decksLoading } = trpc.decks.list.useQuery();
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.list.useQuery();
  const { data: timerHistory } = trpc.timer.history.useQuery();
  const { data: dueCards } = trpc.decks.dueCards.useQuery();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const totalStudyMinutes = timerHistory?.filter(s => s.sessionType === "work").reduce((acc, s) => acc + s.durationMinutes, 0) ?? 0;
  const pendingTasks = tasks?.filter(t => t.status !== "done") ?? [];
  const upcomingTasks = pendingTasks.filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).slice(0, 3);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold font-serif">
          {greeting()}, {user?.name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="text-muted-foreground mt-1">Here's your study overview for today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        {[
          { label: "Documents", value: docs?.length ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", loading: docsLoading },
          { label: "Flashcard Decks", value: decks?.length ?? 0, icon: Brain, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", loading: decksLoading },
          { label: "Study Minutes", value: totalStudyMinutes, icon: Flame, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", loading: false },
          { label: "Cards Due", value: dueCards?.length ?? 0, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", loading: false },
        ].map((stat) => (
          <div key={stat.label} className="study-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                {stat.loading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.path}>
              <div className="study-card p-4 cursor-pointer group flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        {/* Recent Documents */}
        <div className="study-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Recent Documents
            </h2>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          {docsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : docs && docs.length > 0 ? (
            <div className="space-y-2">
              {docs.slice(0, 4).map((doc) => (
                <Link key={doc.id} href={`/library?doc=${doc.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.originalName}</p>
                      <p className="text-xs text-muted-foreground">{doc.wordCount?.toLocaleString()} words · {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No documents yet</p>
              <Link href="/library">
                <Button size="sm" variant="outline" className="mt-3 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Upload First Document
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="study-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Upcoming Deadlines
            </h2>
            <Link href="/planner">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : upcomingTasks.length > 0 ? (
            <div className="space-y-2">
              {upcomingTasks.map((task) => {
                const priorityColor = { low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", high: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" }[task.priority];
                return (
                  <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className={`text-xs ${priorityColor} border-0`}>
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              <Link href="/planner">
                <Button size="sm" variant="outline" className="mt-3 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Due for Review */}
      {dueCards && dueCards.length > 0 && (
        <div className="study-card p-5 border-l-4 border-l-violet-500 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="font-semibold">Spaced Repetition Review</p>
                <p className="text-sm text-muted-foreground">{dueCards.length} card{dueCards.length !== 1 ? "s" : ""} due for review today</p>
              </div>
            </div>
            <Link href="/spaced-rep">
              <Button className="gap-2">
                Review Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
