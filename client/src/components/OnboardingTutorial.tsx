import { useState } from "react";
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
      description: "Your all-in-one study platform. Upload syllabi, generate study materials, and track your progress.",
      color: "from-blue-600 to-blue-400",
      icon: Brain,
    },
    {
      title: "CourseGraph",
      description: "Upload your syllabus and create an interactive knowledge graph. Visualize how concepts connect.",
      color: "from-purple-600 to-purple-400",
      feature: { icon: Brain, label: "CourseGraph", path: "/course-graph" },
    },
    {
      title: "Study Studio",
      description: "Generate flashcards, mind maps, Cornell notes, and timelines from your documents.",
      color: "from-pink-600 to-pink-400",
      feature: { icon: Database, label: "Study Studio", path: "/study-tools" },
    },
    {
      title: "Spaced Repetition",
      description: "Optimize your review schedule with intelligent spaced repetition based on learning science.",
      color: "from-yellow-600 to-yellow-400",
      feature: { icon: Zap, label: "Spaced Repetition", path: "/spaced-rep" },
    },
    {
      title: "Study Timer",
      description: "Pomodoro-style timer with work and break cycles. Track your study sessions.",
      color: "from-orange-600 to-orange-400",
      feature: { icon: Clock, label: "Study Timer", path: "/timer" },
    },
    {
      title: "Voice & Video Notes",
      description: "Record and transcribe voice and video lectures for quick review.",
      color: "from-red-600 to-red-400",
      features: [
        { icon: Mic, label: "Voice Notes", path: "/voice" },
        { icon: Video, label: "Video Notes", path: "/video-notes" },
      ],
    },
    {
      title: "Notes & Planning",
      description: "Take rich notes and plan your study schedule in one place.",
      color: "from-green-600 to-green-400",
      features: [
        { icon: StickyNote, label: "Notes", path: "/notes" },
        { icon: ListTodo, label: "Planner", path: "/planner" },
      ],
    },
    {
      title: "Collaborate & Explore",
      description: "Share study materials, collaborate with classmates, and explore what others are studying.",
      color: "from-indigo-600 to-indigo-400",
      features: [
        { icon: Users, label: "Collab Space", path: "/collab" },
        { icon: Compass, label: "Explore", path: "/explore" },
      ],
    },
    {
      title: "Ready to start",
      description: "Begin by uploading your first syllabus to CourseGraph, or explore any feature from the sidebar.",
      color: "from-cyan-600 to-cyan-400",
      cta: true,
    },
  ];

  const slide = slides[step];
  const isLast = step === slides.length - 1;
  const IconComponent = slide.icon;

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
          "relative h-32 bg-gradient-to-br flex items-center justify-center overflow-hidden",
          `bg-gradient-to-br ${slide.color}`
        )}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
          </div>
          {IconComponent && (
            <div className="relative text-white">
              <IconComponent className="w-12 h-12" />
            </div>
          )}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{slide.title}</h2>
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
            {step + 1} of {slides.length}
          </p>
        </div>
      </div>
    </div>
  );
}
