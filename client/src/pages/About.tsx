import { ChevronRight, Sparkles, BookOpen, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-slate-950">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Home
            </a>
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            About syllabAI
          </h1>
          <p className="text-lg text-muted-foreground">The story behind smarter studying</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Problem Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">The Problem</span>
          </div>
          <h2 className="text-4xl font-bold">I was drowning in tools, not learning</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I grew up using Chegg and other study apps, but something felt off. I wanted to use flashcards—they work—but the friction of creating them felt insurmountable. Between managing ADHD and juggling five different apps just to organize my homework, studying became a chore instead of a skill.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'd find myself wanting to annotate my documents, talk through concepts, draw diagrams—but I'd have to switch between my phone, computer, and a notebook. My files were scattered across Google Drive, OneDrive, and my desktop. The fragmentation was exhausting.
          </p>
        </section>

        {/* Founder Section with Image */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Hi, I'm Ladi</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I built syllabAI because I needed it. I realized that the problem wasn't that study tools didn't exist—it's that they were fragmented. You needed one app for flashcards, another for notes, another for scheduling, another for organizing files. That's not studying smarter; that's studying harder.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              So I decided to create one unified platform where everything you need to ace your exams lives in one place. No switching. No friction. Just learning.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <img
                src="/manus-storage/pasted_file_XsiSh5_IMG_9022_a1b2c3d4.jpeg"
                alt="Ladi, founder of syllabAI"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl blur-2xl" />
          </div>
        </section>

        {/* Solution Section */}
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">The Solution</span>
          </div>
          <h2 className="text-4xl font-bold">All-in-one AI study platform</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            syllabAI combines everything you need into one intelligent platform. Upload your syllabus—we generate flashcards, practice quizzes, and study guides instantly. Use AI to talk through concepts, annotate documents, and create visual mind maps. Track your mastery with spaced repetition. Organize everything in one place.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: BookOpen,
                title: "AI-Powered Generation",
                description: "Transform your documents into flashcards, quizzes, and study materials in seconds",
              },
              {
                icon: Sparkles,
                title: "Unified Workspace",
                description: "Notes, flashcards, timers, and file organization—everything in one app",
              },
              {
                icon: Zap,
                title: "Spaced Repetition",
                description: "Scientifically-proven learning with intelligent review scheduling",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:border-blue-500/40 transition-all duration-300 group"
                >
                  <Icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vision Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Our Vision</span>
          </div>
          <h2 className="text-4xl font-bold">Study smarter, not harder</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every student deserves tools that work with their brain, not against it. Whether you have ADHD, learn visually, or just want to ace your exams, syllabAI adapts to you. We're building the future of learning—one where studying is efficient, intuitive, and actually enjoyable.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our mission is simple: eliminate friction, maximize learning, and help every student unlock their potential.
          </p>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-500/10 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 blur-3xl" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-bold">Ready to study smarter?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are already using syllabAI to transform their study habits and ace their exams.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="gap-2">
                Try us out
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer Spacer */}
      <div className="h-12" />
    </div>
  );
}
