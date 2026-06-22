import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  BookOpen, Brain, Clock, Calendar, Zap, FileText, Mic, Share2,
  ChevronRight, Star, Sparkles, Target, TrendingUp, ArrowRight,
  GraduationCap, FlaskConical, Code2, Landmark
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Flashcards & Spaced Repetition",
    description: "Generate intelligent flashcards from any document. Our SM-2 algorithm schedules reviews at the perfect moment — surpassing Anki in usability.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: FileText,
    title: "Smart Study Tools",
    description: "Cornell notes, mind maps, timelines, and flowcharts — all rendered as beautiful visuals, never raw code. Powered by the latest AI models.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Clock,
    title: "Pomodoro Study Timer",
    description: "Customizable work and break intervals with session history, sound alerts, and productivity analytics to keep you in flow.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Calendar,
    title: "Assignment & Exam Planner",
    description: "AI detects deadlines from your syllabi automatically. Calendar view, manual task entry, and priority management — all in one place.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Mic,
    title: "Voice Notes & Transcription",
    description: "Record voice notes and convert them to flashcards or study content using Whisper-powered transcription. Think out loud, study smarter.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: Share2,
    title: "Select & Share Notes",
    description: "Choose specific notes and send them to yourself or classmates via email or phone. Never lose a key insight again.",
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
  },
];

const simulations = [
  { icon: FlaskConical, label: "Medical", desc: "Clinical case scenarios", color: "text-red-500" },
  { icon: TrendingUp, label: "Finance", desc: "Market & investment decisions", color: "text-green-500" },
  { icon: Code2, label: "Coding", desc: "Technical interview prep", color: "text-blue-500" },
  { icon: Landmark, label: "History", desc: "What-if historical scenarios", color: "text-amber-500" },
];

const stats = [
  { value: "10+", label: "Study Tools" },
  { value: "AI", label: "Powered" },
  { value: "∞", label: "Documents" },
  { value: "100%", label: "Free to Try" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">SyllibAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#simulations" className="hover:text-foreground transition-colors">Simulations</a>
            <a href="#quote" className="hover:text-foreground transition-colors">About</a>
          </div>
          <Button onClick={handleCTA} size="sm" className="gap-2">
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-500/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="container text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium animate-fade-in">
            <Sparkles className="w-3 h-3 text-amber-500" />
            AI-Powered Academic Platform
          </Badge>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Study Smarter,{" "}
            <span className="gradient-text">Not Harder</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.05s" }}>
            Upload your notes, syllabi, and textbooks. SyllibAI transforms them into flashcards,
            mind maps, study guides, quizzes, and personalized study plans — instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <Button size="lg" onClick={handleCTA} className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/25">
              Start Studying Free
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <BookOpen className="w-4 h-4" />
              See Features
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Zap className="w-3 h-3 text-primary" />
              Everything You Need
            </Badge>
            <h2 className="font-serif text-4xl font-bold mb-4">
              One Platform, Every Study Tool
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From AI-generated flashcards to spaced repetition, from voice notes to exam planners — all seamlessly integrated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="study-card p-6 group animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulations ── */}
      <section id="simulations" className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <Target className="w-3 h-3 text-primary" />
                Simulation Environments
              </Badge>
              <h2 className="font-serif text-4xl font-bold mb-6">
                Learn by Doing,{" "}
                <span className="gradient-text">Not Just Reading</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Immersive AI-powered simulations put you in real-world scenarios. Make decisions, get expert feedback, and understand consequences — all in a safe learning environment.
              </p>
              <Button onClick={handleCTA} className="gap-2">
                Try a Simulation
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {simulations.map((s, i) => (
                <div
                  key={s.label}
                  className="study-card p-5 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                  onClick={handleCTA}
                >
                  <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
                  <div className="font-semibold text-sm mb-1">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="container text-center">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Ready to Transform How You Study?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join students who are already studying smarter with AI-powered tools built for academic success.
          </p>
          <Button size="lg" onClick={handleCTA} className="gap-2 px-10 h-12 text-base shadow-lg shadow-primary/25">
            <Star className="w-4 h-4" />
            Start for Free
          </Button>
        </div>
      </section>

      {/* ── Quote Footer ── */}
      <footer id="quote" className="py-20 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-0.5 bg-primary/40 mx-auto mb-8" />
            <blockquote className="font-serif text-xl sm:text-2xl text-muted-foreground italic leading-relaxed">
              "The best platform would be invisible — it removes friction between you and deep understanding, rather than adding features for their own sake."
            </blockquote>
            <div className="w-12 h-0.5 bg-primary/40 mx-auto mt-8 mb-12" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">SyllibAI</span>
            </div>
            <p>© {new Date().getFullYear()} SyllibAI. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
