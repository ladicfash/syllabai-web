import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { MasteryGraphHero } from "@/components/marketing/MasteryGraphHero";
import {
  Brain, Zap, Clock, FlaskConical,
  ArrowRight, BarChart3,
  Search, Video, Eye, Network, Compass, Award
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
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#coursegraph" className="hover:text-foreground transition-colors">CourseGraph</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleStart} className="hidden sm:flex text-foreground/70 hover:text-foreground">
              Sign in
            </Button>
            <Button size="sm" onClick={handleStart} className="gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-1">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 landing-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

        <div className="container relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center py-24 lg:py-32">
          {/* Text column */}
          <div className="flex flex-col items-start text-left gap-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Course-aware AI
            </div>

            <h1
              className="font-display text-5xl sm:text-6xl lg:text-[4.75rem] font-bold leading-[0.98] tracking-tight animate-slide-up"
              style={{ animationDelay: "0.05s" }}
            >
              Know what<br />you don't know.
            </h1>

            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              syllabAI turns your syllabus, notes, and quiz results into a live map of every topic in your course — so you always know exactly what to study next.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <Button
                size="lg"
                onClick={handleStart}
                className="gap-2 px-8 w-full sm:w-auto"
              >
                Start studying free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-8 w-full sm:w-auto"
                onClick={() => document.getElementById("coursegraph")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Network className="w-4 h-4" />
                See how it works
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Free to start · No credit card required
            </p>
          </div>

          {/* Signature visual: the actual mastery graph, not a stock illustration */}
          <div className="relative flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6">
              <MasteryGraphHero className="w-full h-auto" />
              <div className="flex items-center justify-center gap-5 mt-2 text-xs text-muted-foreground font-medium">
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Mastered</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border-2 border-secondary" /> In progress</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-dashed border-muted-foreground" /> Not started</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CourseGraph ─────────────────────────────────────────────────── */}
      <section id="coursegraph" className="py-28 relative bg-muted/25">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              How it works
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
              Meet CourseGraph
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              A live map of your course — every document, deadline, quiz, and note feeds one picture of what you know and what you don't.
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

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 relative border-t border-border">
        <div className="container">
          {/* Section header */}
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Complete toolkit
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
              Everything you need to actually learn the material
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              AI-generated study materials, fullscreen quizzes, spaced repetition, and voice notes — all feeding the same mastery map.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="feature-card group relative"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {f.badge && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold tracking-wide">
                    {f.badge}
                  </div>
                )}
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
      <section className="py-24 relative border-t border-border">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Stop guessing what to study.
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Upload your syllabus and see your first mastery map in minutes.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="gap-2 px-8"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/25 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#coursegraph" className="hover:text-foreground transition">CourseGraph</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition">About</a></li>
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
          </div>
          <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>&copy; 2026 syllabAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
