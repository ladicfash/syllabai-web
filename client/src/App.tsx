import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NotFound from "@/pages/NotFound";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import SourceHub from "./pages/SourceHub";
import StudyToolsClassic from "./pages/StudyTools";
import StudyStudio from "./pages/StudyStudio";
import Timer from "./pages/Timer";
import Planner from "./pages/Planner";
import SpacedRep from "./pages/SpacedRep";
import Notes from "./pages/Notes";
import Simulations from "./pages/Simulations";
import VoiceNotes from "./pages/VoiceNotes";
import VideoNotes from "./pages/VideoNotes";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import CollabSpace from "./pages/CollabSpace";
import Settings from "./pages/Settings";
import { CourseGraph } from "./pages/CourseGraph";
import CourseGraphOnboarding from "./pages/CourseGraphOnboarding";
import StudyRooms from "./pages/StudyRooms";
import StudyLayout from "./components/StudyLayout";
import LogoIntro from "./components/LogoIntro";
import TermsModal from "./components/TermsModal";
import { CommandPalette } from "./components/CommandPalette";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import { useAuth } from "./_core/hooks/useAuth";
import { trpc } from "./lib/trpc";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

// Load Mermaid.js from CDN
function MermaidLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    if (w.mermaid) return;
    const SCRIPT_ID = "syllabai-mermaid";
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      // Surface load failure for diagnostics; Mermaid is optional and the page
      // must keep working even if the CDN is unreachable.
      console.warn("[syllabAI] Failed to load Mermaid from CDN; diagrams will be unavailable.");
    };
    document.head.appendChild(script);
  }, []);
  return null;
}



const SESSION_KEY = "syllabai_intro_shown";

// Syncs user's saved language preference on login
function LanguageSyncer() {
  const { isAuthenticated, user } = useAuth();
  const { i18n } = useTranslation();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const userLanguage = (user as any)?.language || 'en-US';
      if (userLanguage && i18n.language !== userLanguage) {
        i18n.changeLanguage(userLanguage);
      }
    }
  }, [isAuthenticated, user, i18n]);
  
  return null;
}

// Applies the user's saved accent color as a CSS variable on the document root
function AccentColorApplier() {
  const { isAuthenticated } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    const accent = (settings as any)?.accentColor;
    if (accent) {
      // Directly set the primary color CSS variables to the user's chosen accent
      document.documentElement.style.setProperty("--color-primary", accent);
      document.documentElement.style.setProperty("--color-ring", accent);
    } else {
      // Reset to defaults by removing the inline styles
      document.documentElement.style.removeProperty("--color-primary");
      document.documentElement.style.removeProperty("--color-ring");
    }
  }, [(settings as any)?.accentColor]);
  return null;
}

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showIntro, setShowIntro] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const prevAuth = useRef<boolean | null>(null);
  const utils = trpc.useUtils();

  // Show the intro animation only on login/logout transition
  useEffect(() => {
    if (loading) return;
    const justLoggedIn = prevAuth.current === false && isAuthenticated;
    const justLoggedOut = prevAuth.current === true && !isAuthenticated;
    if (justLoggedIn || justLoggedOut) {
      setShowIntro(true);
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, loading]);

  // Show onboarding tutorial only for first-time users on login
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const justLoggedIn = prevAuth.current === false;
      const hasSeenTutorial = !!(user as any).onboardingCompleted;
      if (justLoggedIn && !hasSeenTutorial) {
        setShowIntro(true);
      }
    }
  }, [isAuthenticated, loading, user]);

  const handleOnboardingComplete = useCallback(async () => {
    try {
      await utils.auth.me.invalidate();
    } catch (e) {
      console.warn("Failed to mark onboarding as complete", e);
    }
  }, [utils]);

  // Show terms if user is authenticated but hasn't accepted yet
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const hasAccepted = !!(user as any).acceptedTermsAt;
      if (!hasAccepted && !termsAccepted) {
        setShowTerms(true);
      }
    }
  }, [isAuthenticated, loading, user, termsAccepted]);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleTermsAccepted = useCallback(() => {
    setShowTerms(false);
    setTermsAccepted(true);
    utils.auth.me.invalidate();
  }, [utils]);

  const handleOnboardingCompleteCallback = useCallback(() => {
    handleOnboardingComplete();
  }, [handleOnboardingComplete]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.09 0.03 258)" }}>
        <div className="flex flex-col items-center gap-4">
          <img
            src="/manus-storage/syllibai-icon_7a0c12a1.jpeg"
            alt="syllabAI"
            className="w-12 h-12 rounded-2xl object-cover animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {showIntro && <LogoIntro onComplete={handleIntroComplete} />}
      {isAuthenticated && !(user as any)?.onboardingCompleted && <OnboardingTutorial onComplete={handleOnboardingCompleteCallback} />}
      <TermsModal open={showTerms} onAccepted={handleTermsAccepted} />

      <CommandPalette />
      <LanguageSyncer />
      <Switch>
        {/* Public landing */}
        <Route path="/course-graph/new">
          {loading ? null : isAuthenticated ? <CourseGraphOnboarding /> : <Landing />}
        </Route>
        <Route path="/course-graph">
          {isAuthenticated ? <CourseGraph /> : loading ? null : <Landing />}
        </Route>

        {/* Protected app routes inside StudyLayout */}
        <Route path="/dashboard">
          {loading ? null : isAuthenticated ? <StudyLayout><Dashboard /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/library">
          {loading ? null : isAuthenticated ? <StudyLayout><Library /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/source-hub">
          {loading ? null : isAuthenticated ? <StudyLayout><SourceHub /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/study-tools/classic">
          {loading ? null : isAuthenticated ? <StudyLayout><StudyToolsClassic /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/study-tools">
          {loading ? null : isAuthenticated ? <StudyLayout><StudyStudio /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/study-studio">
          {loading ? null : isAuthenticated ? <StudyLayout><StudyStudio /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/timer">
          {loading ? null : isAuthenticated ? <StudyLayout><Timer /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/planner">
          {loading ? null : isAuthenticated ? <StudyLayout><Planner /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/spaced-rep">
          {loading ? null : isAuthenticated ? <StudyLayout><SpacedRep /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/spaced-repetition">
          {loading ? null : isAuthenticated ? <StudyLayout><SpacedRep /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/notes">
          {loading ? null : isAuthenticated ? <StudyLayout><Notes /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/simulations">
          {loading ? null : isAuthenticated ? <StudyLayout><Simulations /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/voice">
          {loading ? null : isAuthenticated ? <StudyLayout><VoiceNotes /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/voice-notes">
          {loading ? null : isAuthenticated ? <StudyLayout><VoiceNotes /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/video-notes">
          {loading ? null : isAuthenticated ? <StudyLayout><VideoNotes /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/study-rooms/:roomCode">
          {loading ? null : isAuthenticated ? <StudyLayout><StudyRooms /></StudyLayout> : <Landing />}
        </Route>
        <Route path="/study-rooms">
          {loading ? null : isAuthenticated ? <StudyLayout><StudyRooms /></StudyLayout> : <Landing />}
        </Route>

        {/* Collab Space — public but gated */}
        <Route path="/collab">
          {isAuthenticated
            ? <StudyLayout><CollabSpace /></StudyLayout>
            : <CollabSpace />}
        </Route>

        {/* Public profile */}
        <Route path="/profile/:userId">
          {isAuthenticated
            ? <StudyLayout><Profile /></StudyLayout>
            : <Profile />}
        </Route>
        <Route path="/profile">
          {isAuthenticated
            ? <StudyLayout><Profile /></StudyLayout>
            : <Landing />}
        </Route>

        {/* Explore — public but gated */}
        <Route path="/explore">
          {isAuthenticated
            ? <StudyLayout><Explore /></StudyLayout>
            : <Explore />}
        </Route>
        <Route path="/explore/:rest*">
          {isAuthenticated
            ? <StudyLayout><Explore /></StudyLayout>
            : <Explore />}
        </Route>

        {/* Settings — protected */}
        <Route path="/settings">
          {loading ? null : isAuthenticated ? <StudyLayout><Settings /></StudyLayout> : <Landing />}
        </Route>

        {/* Root path — serves Landing for guests, redirects authenticated users to /dashboard */}
        <Route path="/">
          {loading ? null : isAuthenticated ? <Redirect to="/dashboard" /> : <Landing />}
        </Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <MermaidLoader />
          <AccentColorApplier />
          <Toaster richColors position="top-right" />
          <AppRoutes />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
