import { useEffect, useState } from "react";

const ICON_URL = "/manus-storage/syllibai-icon_7a0c12a1.jpeg";

interface LogoIntroProps {
  onComplete: () => void;
}

/**
 * Full-screen logo intro animation shown once per session after login.
 * Sequence:
 *  0–400ms   : icon fades + scales in from 0.6
 *  400–900ms : icon bounces slightly, "syllab" types in letter by letter
 *  900–1100ms: "AI" snaps in with a blue flash
 *  1100–3700ms: whole lockup holds (2.6s hold — extended by 2s)
 *  3700–4150ms: fade out + scale down
 *  4150ms    : onComplete fires
 */
export default function LogoIntro({ onComplete }: LogoIntroProps) {
  const [phase, setPhase] = useState<"enter" | "text" | "ai" | "hold" | "exit">("enter");
  const [visibleChars, setVisibleChars] = useState(0);
  const wordSyllab = "syllab";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 400);
    return () => clearTimeout(t1);
  }, []);

  // Type out "syllab" letter by letter once phase === "text"
  useEffect(() => {
    if (phase !== "text") return;
    if (visibleChars >= wordSyllab.length) {
      const t = setTimeout(() => setPhase("ai"), 80);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleChars((c) => c + 1), 60);
    return () => clearTimeout(t);
  }, [phase, visibleChars]);

  useEffect(() => {
    if (phase !== "ai") return;
    const t1 = setTimeout(() => setPhase("hold"), 200);
    return () => clearTimeout(t1);
  }, [phase]);

  useEffect(() => {
    if (phase !== "hold") return;
    const t1 = setTimeout(() => setPhase("exit"), 2600);
    return () => clearTimeout(t1);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t1 = setTimeout(() => onComplete(), 450);
    // Total animation duration: ~4150ms
    return () => clearTimeout(t1);
  }, [phase, onComplete]);

  const iconScale =
    phase === "enter" ? "scale-75 opacity-0" :
    phase === "text" ? "scale-100 opacity-100" :
    phase === "exit" ? "scale-90 opacity-0" :
    "scale-100 opacity-100";

  const wrapperOpacity = phase === "exit" ? "opacity-0 scale-95" : "opacity-100 scale-100";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "oklch(0.09 0.03 258)",
        transition: phase === "exit" ? "opacity 0.45s cubic-bezier(0.23,1,0.32,1), transform 0.45s cubic-bezier(0.23,1,0.32,1)" : "none",
      }}
    >
      {/* Radial glow behind logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.52 0.19 232 / 0.18), transparent 70%)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}
      />

      {/* Lockup */}
      <div
        className={`flex items-center gap-5 transition-all duration-450 ${wrapperOpacity}`}
        style={{ transition: "opacity 0.45s cubic-bezier(0.23,1,0.32,1), transform 0.45s cubic-bezier(0.23,1,0.32,1)" }}
      >
        {/* Icon */}
        <div
          className={`transition-all duration-500 ${iconScale}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <img
            src={ICON_URL}
            alt="syllabAI"
            className="w-16 h-16 rounded-2xl object-cover shadow-2xl"
            style={{ boxShadow: "0 0 40px oklch(0.52 0.19 232 / 0.4)" }}
          />
        </div>

        {/* Wordmark */}
        <div className="flex items-baseline overflow-hidden" style={{ height: "3.5rem" }}>
          {/* "syllab" — typed in */}
          <span
            className="font-display font-bold text-white tracking-tight"
            style={{
              fontSize: "3rem",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              opacity: phase === "enter" ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {wordSyllab.slice(0, visibleChars)}
          </span>

          {/* "AI" — snaps in with a flash */}
          <span
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "3rem",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, oklch(0.62 0.19 232), oklch(0.75 0.18 220))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: phase === "ai" || phase === "hold" || phase === "exit" ? 1 : 0,
              transform: phase === "ai" || phase === "hold" || phase === "exit" ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
              transition: "opacity 0.18s cubic-bezier(0.34,1.56,0.64,1), transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              filter: phase === "ai" ? "brightness(1.6)" : "brightness(1)",
            }}
          >
            AI
          </span>
        </div>
      </div>

      {/* Subtle bottom tagline */}
      <div
        className="absolute bottom-12 text-center"
        style={{
          opacity: phase === "hold" || phase === "exit" ? 0.5 : 0,
          transition: "opacity 0.4s ease",
          color: "oklch(0.6 0.02 240)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "var(--font-sans)",
        }}
      >
        Study Smarter
      </div>
    </div>
  );
}
