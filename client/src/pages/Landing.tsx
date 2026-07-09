import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Brain, Zap, Clock, FileText, Mic, FlaskConical,
  ArrowRight, CheckCircle2, ChevronRight, Star,
  BookOpen, Target, Calendar, StickyNote, BarChart3,
  Upload, Layers, Sparkles, TrendingUp, Code2, Landmark, Globe,
  Search, Video, Eye, Lightbulb, Network, Compass, Award
} from "lucide-react";

const LOGO_URL = "/manus-storage/syllibai-logo_2db0f2cf.png";

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
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
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
    icon: Network,
    title: "CourseGraph",
    desc: "Knowledge graph that understands your course, tracks mastery, and recommends what to study next.",
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-500",
    badge: "PROPRIETARY",
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
];

const toolMarqueeItems = [
  "CourseGraph", "Study Studio", "Source Hub", "Focus Lock Quiz", "Video Editor",
  "Flashcards", "Mind Maps", "Cornell Notes", "Spaced Repetition",
  "Pomodoro Timer", "Voice Notes", "AI Simulations", "Planner",
];

const stats = [
  { value: "13+", label: "Research DBs" },
  { value: "AI", label: "Powered" },
  { value: "∞", label: "Documents" },
  { value: "Free", label: "To Start" },
];

const courseGraphFeatures = [
  {
    icon: Network,
    title: "Knowledge Graph",
    desc: "Automatically builds a knowledge graph from your syllabus, PDFs, notes, voice notes, video transcripts, and quiz results.",
  },
  {
    icon: BarChart3,
    title: "Mastery Tracking",
    desc: "Tracks your mastery across every topic with evidence from quizzes, flashcards, and AI assessments.",
  },
  {
    icon: Compass,
    title: "Smart Study Plans",
    desc: "AI-generated study plans based on your mastery levels, exam dates, and learning pace.",
  },
  {
    icon: Award,
    title: "Weak Area Detection",
    desc: "Identifies weak areas and recommends exactly what to study next for maximum retention.",
  },
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
            <a href="#coursegraph" className="hover:text-foreground transition-colors">CourseGraph</a>
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
          className="absolute top-1/3 -left-48 w-96 h-96 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{
            background: "oklch(0.62 0.19 232)",
            transform: `translateY(${scrollY * 0.12}px)`,
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/3 -right-48 w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{
            background: "oklch(0.62 0.19 232)",
            transform: `translateY(${scrollY * -0.08}px)`,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        <div className="container relative z-10 flex flex-col items-center text-center gap-8 py-24">
          {/* Badge */}
          <div className="pill-badge animate-fade-in">
            <Sparkles className="w-3 h-3" />
            Personalized Academic Intelligence
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
            The first AI study platform that understands your course, tracks your mastery, and tells you what to study next.
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
              onClick={() => document.getElementById("coursegraph")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Network className="w-4 h-4" />
              Explore CourseGraph
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 animate-rise">
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

      {/* ── CourseGraph ─────────────────────────────────────────────────── */}
      <section id="coursegraph" className="py-28 relative bg-muted/25">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="pill-badge">
              <Network className="w-3 h-3" />
              Proprietary Technology
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
              Meet{" "}
              <span className="gradient-text">CourseGraph</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Personalized academic intelligence across every document, deadline, quiz, note, and study session.
            </p>
          </div>

          {/* CourseGraph features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {courseGraphFeatures.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 leading-snug">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CourseGraph CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setLocation("/course-graph")}
              className="gap-2 px-8 h-12 text-base"
            >
              View CourseGraph Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
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
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-sm leading-snug mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to study smarter?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of students using syllabAI to master their courses with CourseGraph.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="gap-2 px-8 h-12 text-base shadow-xl shadow-primary/30"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/25 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition"></a></li>
                <li><a href="#" className="hover:text-foreground transition"></a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Legal</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="https://trust.manus.im/" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="https://trust.manus.im/" className="hover:text-foreground transition">GDPR</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Connect</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition"></a></li>
                <li><a href="#" className="hover:text-foreground transition">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>&copy; 2026 syllabAI. All rights reserved. | GDPR Compliant | SOC2 Certified | WCAG 2.1 AA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
