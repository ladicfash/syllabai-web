import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  Brain, Zap, Clock, FileText, Mic, FlaskConical,
  ArrowRight, CheckCircle2, ChevronRight, Star,
  BookOpen, Target, Calendar, StickyNote, BarChart3,
  Upload, Layers, Sparkles, TrendingUp, Code2, Landmark, Globe,
  Search, Video, Eye, Lightbulb
} from "lucide-react";

const LOGO_URL = "/manus-storage/syllibai-logo_2db0f2cf.png";
const ICON_URL = "/manus-storage/syllibai-icon_7a0c12a1.jpeg";

const features = [
  {
    icon: Brain,
    title: "Study Studio",
    desc: "AI generates flashcards, mind maps, Cornell notes, timelines, and flowcharts in seconds.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
    badge: "NEW",
  },
  {
    icon: Search,
    title: "Source Hub",
    desc: "Search 13+ academic databases (PubMed, arXiv, OpenAlex, Semantic Scholar, DOI, and more).",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-500",
    badge: "NEW",
  },
  {
    icon: Eye,
    title: "Focus Lock Quiz Me",
    desc: "Fullscreen quiz mode with AI grading, focus tracking, and detailed performance reports.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-500",
    badge: "NEW",
  },
  {
    icon: Video,
    title: "Lite Video Editor",
    desc: "Record lectures, trim clips, add chapters, and auto-transcribe with Whisper AI.",
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-500",
    badge: "NEW",
  },
  {
    icon: Zap,
    title: "Spaced Repetition",
    desc: "SM-2 algorithm schedules reviews at the exact moment your memory needs reinforcement.",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-500",
  },
  {
    icon: Clock,
    title: "Pomodoro Timer",
    desc: "Customizable work/break cycles with session history and sound alerts.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: FlaskConical,
    title: "AI Simulations",
    desc: "Role-aware scenarios for medical, finance, coding, history. Learn by doing.",
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-500",
  },
  {
    icon: Mic,
    title: "Voice Notes",
    desc: "Record thoughts. Whisper AI transcribes instantly and converts to study materials.",
    color: "from-sky-500/20 to-sky-600/5",
    iconColor: "text-sky-500",
  },
];

const toolMarqueeItems = [
  "Study Studio", "Source Hub", "Focus Lock Quiz", "Video Editor",
  "Flashcards", "Mind Maps", "Cornell Notes", "Spaced Repetition",
  "Pomodoro Timer", "Voice Notes", "AI Simulations", "Planner",
];

const stats = [
  { value: "13+", label: "Research DBs" },
  { value: "AI", label: "Powered" },
  { value: "∞", label: "Documents" },
  { value: "Free", label: "To Start" },
];

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStart = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const doubled = [...toolMarqueeItems, ...toolMarqueeItems];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 40
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}>
        <div className="container flex items-center justify-between h-16">
          <img src={LOGO_URL} alt="syllabAI" className="h-8 object-contain" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#new" className="hover:text-foreground transition-colors">What's New</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleStart} className="hidden sm:flex text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
            <Button size="sm" onClick={handleStart} className="gap-1.5 shadow-md shadow-primary/20">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 landing-grid" />
        <div className="absolute inset-0 landing-glow" />
        <div className="absolute inset-0 landing-noise pointer-events-none" />

        {/* Animated gradient orbs */}
        <div
          className="absolute top-1/3 -left-48 w-96 h-96 rounded-full opacity-[0.15] blur-3xl pointer-events-none"
          style={{
            background: "oklch(0.52 0.19 232)",
            transform: `translateY(${scrollY * 0.12}px)`,
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/3 -right-48 w-96 h-96 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
          style={{
            background: "oklch(0.55 0.2 285)",
            transform: `translateY(${scrollY * -0.08}px)`,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        <div className="container relative z-10 flex flex-col items-center text-center gap-8 py-24">
          {/* Badge */}
          <div className="pill-badge animate-fade-in">
            <Sparkles className="w-3 h-3" />
            AI-Powered Academic Platform
          </div>

          {/* Headline */}
          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.92] tracking-tight max-w-5xl animate-slide-up"
            style={{ animationDelay: "0.05s" }}
          >
            Study Smarter.{" "}
            <br className="hidden sm:block" />
            <span className="relative inline-block mt-2">
              <span className="gradient-text">Not Harder.</span>
              {/* Underline squiggle */}
              <svg
                className="absolute -bottom-3 left-0 w-full"
                viewBox="0 0 400 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9 Q50 3 100 9 Q150 15 200 9 Q250 3 300 9 Q350 15 398 9"
                  stroke="oklch(0.52 0.19 232)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.55"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Upload your syllabus. Search 13+ research databases. Generate study materials with AI. Take fullscreen quizzes. All in one platform.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <Button
              size="lg"
              onClick={handleStart}
              className="gap-2 px-8 h-12 text-base shadow-xl shadow-primary/30 hover:shadow-primary/45 transition-all hover:-translate-y-0.5"
            >
              Start Studying Free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8 h-12 text-base bg-background/60 backdrop-blur-sm"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              <BookOpen className="w-4 h-4" />
              See All Features
            </Button>
          </div>

          {/* Trust signals */}
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex -space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>No credit card required · Free to start</span>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-4 gap-8 mt-2 pt-8 border-t border-border/50 w-full max-w-md animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary" />
          <ChevronRight className="w-4 h-4 rotate-90 text-primary" />
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────────────────── */}
      <section className="py-5 border-y border-border bg-muted/20 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="marquee-track">
            {doubled.map((tool, i) => (
              <span
                key={i}
                className="flex items-center gap-3 text-sm font-semibold text-muted-foreground whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block flex-shrink-0" />
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's New ──────────────────────────────────────────────────── */}
      <section id="new" className="py-28 relative">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="pill-badge">
              <Lightbulb className="w-3 h-3" />
              Latest Features
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
              What's New in{" "}
              <span className="gradient-text">syllabAI</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Four powerful new tools to supercharge your study workflow.
            </p>
          </div>

          {/* New features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.slice(0, 4).map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Badge */}
                {f.badge && (
                  <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {f.badge}
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-muted/25 relative">
        <div className="container">
          {/* Section header */}
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="pill-badge">
              <Layers className="w-3 h-3" />
              Complete Toolkit
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
              Everything You Need{" "}
              <span className="gradient-text">to Ace Your Exams</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              From AI-generated study materials to fullscreen quizzes, spaced repetition, and voice notes — all seamlessly integrated.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="feature-card group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-display font-semibold text-base mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 landing-grid opacity-40" />
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="pill-badge">
              <Target className="w-3 h-3" />
              How It Works
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              From Upload to{" "}
              <span className="gradient-text">Ace in Minutes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Your Materials",
                desc: "Drop in PDFs, DOCX files, images, or photos. OCR extracts text from anything.",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Generates Study Tools",
                desc: "Get flashcards, mind maps, Cornell notes, quizzes, and key points instantly.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Track Progress & Master",
                desc: "Spaced repetition schedules reviews. Fullscreen quizzes track your mastery.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {/* Step number */}
                <div className="absolute -top-6 left-0 right-0 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-display font-bold text-primary">
                    {item.step}
                  </div>
                </div>

                {/* Card */}
                <div className="pt-8 rounded-2xl border border-border/50 bg-card p-6 text-center">
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>

                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 landing-glow opacity-50" />
        <div className="container relative z-10">
          <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-12 md:p-16 text-center">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Ready to Study Smarter?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students using syllabAI to ace their exams. No credit card required.
            </p>
            <Button
              size="lg"
              onClick={handleStart}
              className="gap-2 px-8 h-12 text-base shadow-xl shadow-primary/30 hover:shadow-primary/45 transition-all hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-border/50 bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={LOGO_URL} alt="syllabAI" className="h-6 object-contain mb-4" />
              <p className="text-sm text-muted-foreground">AI-powered study platform for the modern student.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#new" className="hover:text-foreground transition-colors">What's New</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2026 syllabAI. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Status</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
      `}</style>
    </div>
  );
}
