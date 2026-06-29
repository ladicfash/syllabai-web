import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, X, BookOpen, Brain, Zap, Clock, StickyNote, Users, Compass, Database, Video, Mic, FlaskConical, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slides = [
    {
      title: "Welcome to syllabAI",
      subtitle: "Your All-in-One Study Platform",
      description: "We've built the most comprehensive study tool to help you learn smarter, not harder.",
      icon: "🎓",
      color: "from-blue-600 to-blue-400",
    },
    {
      title: "CourseGraph",
      subtitle: "Visualize Your Knowledge",
      description: "Upload your syllabus and watch as AI automatically creates an interactive knowledge graph. See how concepts connect and build your understanding visually.",
      icon: "🧠",
      color: "from-purple-600 to-purple-400",
      feature: { icon: Brain, label: "CourseGraph", path: "/course-graph" },
    },
    {
      title: "Study Studio",
      subtitle: "AI-Powered Study Materials",
      description: "Transform your documents into flashcards, mind maps, Cornell notes, timelines, and more. Let AI generate study materials tailored to your learning style.",
      icon: "✨",
      color: "from-pink-600 to-pink-400",
      feature: { icon: Database, label: "Study Studio", path: "/study-tools" },
    },
    {
      title: "Spaced Repetition",
      subtitle: "Learn Smarter with Science",
      description: "Our intelligent spaced repetition system optimizes your review schedule using proven learning science. Study less, remember more.",
      icon: "⚡",
      color: "from-yellow-600 to-yellow-400",
      feature: { icon: Zap, label: "Spaced Repetition", path: "/spaced-rep" },
    },
    {
      title: "Study Timer",
      subtitle: "Focus & Productivity",
      description: "Pomodoro-style timer with work/break cycles. Track your study sessions and build a consistent study habit.",
      icon: "⏱️",
      color: "from-orange-600 to-orange-400",
      feature: { icon: Clock, label: "Study Timer", path: "/timer" },
    },
    {
      title: "Voice & Video Notes",
      subtitle: "Learn Your Way",
      description: "Record voice notes and video lectures. AI transcribes and summarizes them automatically for quick review.",
      icon: "🎙️",
      color: "from-red-600 to-red-400",
      features: [
        { icon: Mic, label: "Voice Notes", path: "/voice" },
        { icon: Video, label: "Video Notes", path: "/video-notes" },
      ],
    },
    {
      title: "Notes & Planning",
      subtitle: "Organize Your Studies",
      description: "Take rich notes, plan your study schedule, and track your progress all in one place.",
      icon: "📝",
      color: "from-green-600 to-green-400",
      features: [
        { icon: StickyNote, label: "Notes", path: "/notes" },
        { icon: ListTodo, label: "Planner", path: "/planner" },
      ],
    },
    {
      title: "Collaborate & Explore",
      subtitle: "Learn Together",
      description: "Share your study materials, collaborate with classmates, and explore what others are studying.",
      icon: "👥",
      color: "from-indigo-600 to-indigo-400",
      features: [
        { icon: Users, label: "Collab Space", path: "/collab" },
        { icon: Compass, label: "Explore", path: "/explore" },
      ],
    },
    {
      title: "You're All Set!",
      subtitle: "Ready to Study Smarter",
      description: "Start by uploading your first syllabus to CourseGraph, or explore any feature from the sidebar. Your learning journey starts now.",
      icon: "🚀",
      color: "from-cyan-600 to-cyan-400",
      cta: true,
    },
  ];

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={cn(
          "relative h-40 bg-gradient-to-br flex items-center justify-center text-white overflow-hidden",
          `bg-gradient-to-br ${slide.color}`
        )}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
          </div>
          <div className="relative text-6xl">{slide.icon}</div>
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{slide.title}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">{slide.subtitle}</p>
          <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">{slide.description}</p>

          {/* Feature buttons */}
          {slide.feature && (
            <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <a
                href={slide.feature.path}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = slide.feature.path;
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <slide.feature.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-slate-900 dark:text-white">{slide.feature.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
              </a>
            </div>
          )}

          {slide.features && (
            <div className="mb-8 grid grid-cols-2 gap-3">
              {slide.features.map((feature) => (
                <a
                  key={feature.path}
                  href={feature.path}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = feature.path;
                  }}
                  className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{feature.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex gap-1 mb-8">
            {slides.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === step ? "bg-primary w-8" : "bg-slate-300 dark:bg-slate-600 flex-1"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Step counter */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            Step {step + 1} of {slides.length}
          </p>
        </div>
      </div>
    </div>
  );
}
