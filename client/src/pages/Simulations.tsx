import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FlaskConical, TrendingUp, Code2, Landmark, Send, RotateCcw, Loader2, Bot, User,
  Sparkles, Trophy, Target, GitBranch, GraduationCap, Stethoscope, BriefcaseBusiness,
  TerminalSquare, ScrollText, Wand2, CheckCircle2, Lock, FileQuestion, Maximize2,
  AlertTriangle, XCircle, ClipboardList, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownView } from "@/components/MarkdownView";

type Domain = "medical" | "finance" | "coding" | "history" | "custom";
type Difficulty = "beginner" | "intermediate" | "advanced";
type Mode = "guided" | "branching" | "interview";
type Message = { role: "user" | "assistant"; content: string };
type QuizState = "idle" | "setup" | "ready" | "taking" | "report";
type QuizQuestion = {
  id: string;
  type: "mcq" | "short_answer";
  question: string;
  choices: string[];
  correctAnswer: string;
  correctChoiceIndex: number;
  explanation: string;
  sourceSnippet?: string;
};

type QuizReport = {
  id?: number;
  scorePercent: number;
  mcqCorrect: number;
  mcqTotal: number;
  shortAnswerScore: number;
  shortGrades: { id: string; points: number; feedback: string }[];
  flags: QuizFlags;
};

type QuizFlags = { fullscreenExits: number; tabHidden: number; windowBlur: number; copyAttempts: number };

const DOMAINS = [
  { id: "medical" as Domain, label: "Medical", icon: FlaskConical, accentIcon: Stethoscope, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", ring: "ring-red-500/20", gradient: "from-red-500/15 to-rose-500/5", border: "border-red-200 dark:border-red-800/70", description: "Clinical case scenarios and diagnostic reasoning", skills: ["Differential diagnosis", "Workup", "Treatment decisions"], starter: "Start an original clinical case involving a patient with chest pain and shortness of breath. Make me reason step-by-step." },
  { id: "finance" as Domain, label: "Finance", icon: TrendingUp, accentIcon: BriefcaseBusiness, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", ring: "ring-emerald-500/20", gradient: "from-emerald-500/15 to-green-500/5", border: "border-emerald-200 dark:border-emerald-800/70", description: "Investment decisions and market analysis", skills: ["Risk analysis", "Portfolio allocation", "Market reasoning"], starter: "Start a portfolio allocation scenario for a 30-year-old investor with moderate risk tolerance and changing market conditions." },
  { id: "coding" as Domain, label: "Coding", icon: Code2, accentIcon: TerminalSquare, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", ring: "ring-blue-500/20", gradient: "from-blue-500/15 to-cyan-500/5", border: "border-blue-200 dark:border-blue-800/70", description: "Technical interviews and system design", skills: ["Algorithms", "System design", "Tradeoffs"], starter: "Start a realistic technical interview. Give me either a medium algorithm problem or a small system design scenario and evaluate my approach." },
  { id: "history" as Domain, label: "History", icon: Landmark, accentIcon: ScrollText, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", ring: "ring-amber-500/20", gradient: "from-amber-500/15 to-orange-500/5", border: "border-amber-200 dark:border-amber-800/70", description: "What-if historical scenarios and analysis", skills: ["Cause/effect", "Counterfactuals", "Evidence-based analysis"], starter: "Start a historically rigorous what-if scenario. Give me context, a decision point, and ask me to reason through consequences." },
];

const QUICK_RESPONSES = [
  "Ask one clarifying question before I decide.",
  "I choose option A. Walk me through the consequences.",
  "Challenge my reasoning and tell me what I missed.",
  "Give me feedback and advance to the next decision point.",
];

const cleanFlags = (): QuizFlags => ({ fullscreenExits: 0, tabHidden: 0, windowBlur: 0, copyAttempts: 0 });

export default function Simulations() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [mode, setMode] = useState<Mode>("branching");
  const [customDomain, setCustomDomain] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [scenario, setScenario] = useState("");
  const [score, setScore] = useState({ decisions: 0, feedback: 0 });

  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [quizDocId, setQuizDocId] = useState<number | undefined>();
  const [quizCount, setQuizCount] = useState(10);
  const [quizTitle, setQuizTitle] = useState("Quiz Me");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFlags, setQuizFlags] = useState<QuizFlags>(cleanFlags());
  const [startedAt, setStartedAt] = useState<string>("");
  const [quizReport, setQuizReport] = useState<QuizReport | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: docs = [] } = trpc.documents.list.useQuery();
  const { data: quizReports = [] } = trpc.ai.quizMeReports.useQuery();
  const simulationMut = trpc.ai.simulation.useMutation();
  const generateQuiz = trpc.ai.generateQuizMe.useMutation({
    onSuccess: (data) => {
      setQuizTitle(data.title);
      setQuestions(data.questions as QuizQuestion[]);
      setAnswers({});
      setQuizIndex(0);
      setQuizFlags(cleanFlags());
      setQuizReport(null);
      setQuizState("ready");
      toast.success("Quiz generated. Enter Focus Lock to begin.");
    },
    onError: (err) => toast.error(err.message),
  });
  const submitQuiz = trpc.ai.submitQuizMe.useMutation({
    onSuccess: (data) => {
      setQuizReport(data as QuizReport);
      setQuizState("report");
      utils.ai.quizMeReports.invalidate();
      toast.success(`Quiz complete — ${data.scorePercent}%`);
    },
    onError: (err) => toast.error(err.message),
  });

  const activeDomain = selectedDomain === "custom"
    ? { id: "custom" as Domain, label: customDomain || "Custom", icon: Wand2, accentIcon: GraduationCap, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", ring: "ring-violet-500/20", gradient: "from-violet-500/15 to-fuchsia-500/5", border: "border-violet-200 dark:border-violet-800/70", description: customGoal || "Custom role-aware simulation", skills: ["Custom reasoning", "Decision-making", "Feedback"], starter: customGoal || "Start a custom educational simulation." }
    : DOMAINS.find((d) => d.id === selectedDomain);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, simulationMut.isPending]);

  useEffect(() => {
    if (quizState !== "taking") return;
    const flag = (key: keyof QuizFlags) => setQuizFlags((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    const onFullscreen = () => {
      if (document.fullscreenElement !== quizRef.current) {
        flag("fullscreenExits");
        toast.warning("Focus Lock warning: fullscreen was exited. This will be saved in your report.");
      }
    };
    const onVisibility = () => {
      if (document.hidden) flag("tabHidden");
    };
    const onBlur = () => flag("windowBlur");
    const onCopy = (event: ClipboardEvent) => {
      event.preventDefault();
      flag("copyAttempts");
      toast.warning("Copying is disabled during Focus Lock.");
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onCopy);
    document.addEventListener("cut", onCopy);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("cut", onCopy);
    };
  }, [quizState]);

  const startSimulation = async (domain: Domain) => {
    if (domain === "custom" && !customDomain.trim()) return toast.error("Name your custom simulation subject first");
    const d = domain === "custom" ? { starter: customGoal || `Create a ${customDomain} simulation with realistic decisions and feedback.` } : DOMAINS.find((item) => item.id === domain)!;
    setSelectedDomain(domain);
    setQuizState("idle");
    setMessages([]);
    setScore({ decisions: 0, feedback: 0 });
    setScenario(d.starter);
    try {
      const result = await simulationMut.mutateAsync({ domain, customDomain: customDomain.trim() || undefined, difficulty, mode, scenario: d.starter, conversationHistory: [] });
      setMessages([{ role: "assistant", content: result.response }]);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start simulation");
      setSelectedDomain(null);
    }
  };

  const sendMessage = async (override?: string) => {
    const content = (override ?? input).trim();
    if (!content || !selectedDomain) return;
    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setScore((prev) => ({ ...prev, decisions: prev.decisions + 1 }));
    try {
      const result = await simulationMut.mutateAsync({ domain: selectedDomain, customDomain: customDomain.trim() || undefined, difficulty, mode, scenario, userResponse: content, conversationHistory: messages });
      setMessages([...newMessages, { role: "assistant", content: result.response }]);
      setScore((prev) => ({ ...prev, feedback: prev.feedback + 1 }));
    } catch (err: any) {
      toast.error(err.message ?? "Failed to get response");
    }
  };

  const reset = () => {
    setSelectedDomain(null);
    setQuizState("idle");
    setMessages([]);
    setInput("");
    setScenario("");
    setScore({ decisions: 0, feedback: 0 });
  };

  const openQuizMe = () => {
    setSelectedDomain(null);
    setQuizState("setup");
    setQuestions([]);
    setQuizReport(null);
    setQuizFlags(cleanFlags());
  };

  const generateQuizMe = () => {
    if (!quizDocId) return toast.error("Select a document first");
    generateQuiz.mutate({ documentId: quizDocId, questionCount: quizCount, difficulty });
  };

  const beginFocusQuiz = async () => {
    if (!quizRef.current) return;
    try {
      await quizRef.current.requestFullscreen();
      setStartedAt(new Date().toISOString());
      setQuizState("taking");
    } catch {
      toast.error("Fullscreen permission is required to start Focus Lock mode.");
    }
  };

  const finishQuiz = async () => {
    if (!quizDocId || questions.length === 0) return;
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    submitQuiz.mutate({ documentId: quizDocId, title: quizTitle, startedAt: startedAt || new Date().toISOString(), questions, answers, flags: quizFlags });
  };

  const currentQuestion = questions[quizIndex];
  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim()).length;
  const selectedDoc = docs.find((doc) => doc.id === quizDocId);

  const renderQuizPanel = () => (
    <div ref={quizRef} className={cn("rounded-3xl border bg-card shadow-sm overflow-hidden", quizState === "taking" && "fixed inset-0 z-50 rounded-none border-0 bg-background")}> 
      {quizState === "setup" || quizState === "ready" ? (
        <div className="p-5 md:p-6 space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <Lock className="w-3.5 h-3.5" /> Focus Lock Quiz Me
              </div>
              <h2 className="text-2xl font-bold">Document-based quiz mode</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">Pre-generate a mixed MCQ + short-answer quiz from a document. Fullscreen is required to begin; exits and tab switches are saved in your report.</p>
            </div>
            <Button variant="outline" onClick={() => setQuizState("idle")}><RotateCcw className="w-4 h-4 mr-2" /> Back</Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border p-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label className="text-sm font-medium">Source document</label>
                  <Select value={quizDocId?.toString() ?? ""} onValueChange={(value) => setQuizDocId(Number(value))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a document with extracted text" /></SelectTrigger>
                    <SelectContent>
                      {docs.filter((doc) => !!doc.extractedText).map((doc) => <SelectItem key={doc.id} value={doc.id.toString()}>{doc.originalName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Questions</label>
                  <Select value={String(quizCount)} onValueChange={(value) => setQuizCount(Number(value))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[5, 10, 15, 20].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={generateQuizMe} disabled={!quizDocId || generateQuiz.isPending} className="w-full gap-2">
                    {generateQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
                  </Button>
                </div>
              </div>
              {questions.length > 0 && (
                <div className="rounded-2xl border bg-primary/5 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div><p className="font-semibold">{quizTitle}</p><p className="text-sm text-muted-foreground">{questions.length} questions ready · {selectedDoc?.originalName}</p></div>
                  <Button onClick={beginFocusQuiz} className="gap-2"><Maximize2 className="w-4 h-4" /> Enter Focus Lock & Begin</Button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border p-4">
              <p className="font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Recent reports</p>
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {quizReports.length === 0 ? <p className="text-sm text-muted-foreground">Completed Quiz Me reports will appear here.</p> : quizReports.slice(0, 5).map((report: any) => (
                  <div key={report.id} className="rounded-xl border p-3"><p className="text-sm font-medium truncate">{report.title}</p><p className="text-xs text-muted-foreground">{report.scorePercent}% · {new Date(report.createdAt).toLocaleDateString()}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : quizState === "taking" && currentQuestion ? (
        <div className="h-full flex flex-col">
          <div className="border-b bg-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold flex items-center gap-2"><EyeOff className="w-4 h-4 text-primary" /> Focus Lock: {quizTitle}</p><p className="text-xs text-muted-foreground">Question {quizIndex + 1} of {questions.length} · {answeredCount}/{questions.length} answered</p></div>
            <div className="flex items-center gap-2"><Badge variant="outline">Flags: {quizFlags.fullscreenExits + quizFlags.tabHidden + quizFlags.windowBlur + quizFlags.copyAttempts}</Badge><Button variant="destructive" onClick={finishQuiz} disabled={submitQuiz.isPending}>Finish</Button></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-5">
              <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${((quizIndex + 1) / questions.length) * 100}%` }} /></div>
              <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm">
                <Badge className="mb-4">{currentQuestion.type === "mcq" ? "Multiple choice" : "Short answer"}</Badge>
                <h2 className="text-xl font-semibold leading-relaxed">{currentQuestion.question}</h2>
                {currentQuestion.sourceSnippet && <p className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">Source hint: “{currentQuestion.sourceSnippet}”</p>}
                <div className="mt-6 space-y-3">
                  {currentQuestion.type === "mcq" ? currentQuestion.choices.map((choice, index) => (
                    <button key={choice} onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: String(index) }))} className={cn("w-full rounded-2xl border p-4 text-left transition-all hover:bg-muted", answers[currentQuestion.id] === String(index) && "border-primary bg-primary/10 ring-2 ring-primary/15")}>
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>{choice}
                    </button>
                  )) : (
                    <Textarea value={answers[currentQuestion.id] ?? ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))} placeholder="Type your answer. AI will grade this after you finish." className="min-h-40" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2"><Button variant="outline" onClick={() => setQuizIndex((i) => Math.max(0, i - 1))} disabled={quizIndex === 0}>Previous</Button><Button onClick={() => quizIndex === questions.length - 1 ? finishQuiz() : setQuizIndex((i) => Math.min(questions.length - 1, i + 1))}>{quizIndex === questions.length - 1 ? "Done / Score Quiz" : "Next"}</Button></div>
            </div>
          </div>
        </div>
      ) : quizState === "report" && quizReport ? (
        <div className="p-6 md:p-8 space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div><Badge className="mb-3">Quiz report saved</Badge><h2 className="text-3xl font-bold">Score: {quizReport.scorePercent}%</h2><p className="text-sm text-muted-foreground mt-1">MCQ {quizReport.mcqCorrect}/{quizReport.mcqTotal} · Short answer {quizReport.shortAnswerScore}%</p></div>
            <Button onClick={() => { setQuizState("setup"); setQuestions([]); setQuizReport(null); }}><RotateCcw className="w-4 h-4 mr-2" /> New Quiz</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[ ["Fullscreen exits", quizReport.flags.fullscreenExits], ["Tab switches", quizReport.flags.tabHidden], ["Window blur", quizReport.flags.windowBlur], ["Copy attempts", quizReport.flags.copyAttempts] ].map(([label, value]) => <div key={label} className="rounded-2xl border p-4"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}
          </div>
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const answer = answers[q.id];
              const short = quizReport.shortGrades.find((g) => g.id === q.id);
              const correct = q.type === "mcq" ? Number(answer) === q.correctChoiceIndex : (short?.points ?? 0) >= 0.7;
              return <div key={q.id} className="rounded-2xl border p-4"><div className="flex items-start gap-2"><div className="mt-0.5">{correct ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}</div><div><p className="font-medium">{idx + 1}. {q.question}</p><p className="text-sm text-muted-foreground mt-1">Correct: {q.correctAnswer}</p>{short && <p className="text-sm mt-1">AI feedback: {short.feedback}</p>}<p className="text-xs text-muted-foreground mt-2">{q.explanation}</p></div></div></div>;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="mobile-page p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8 shadow-sm animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3"><Sparkles className="w-3.5 h-3.5" /> Interactive AI role-play lab</div>
            <h1 className="text-3xl font-bold tracking-tight font-serif">Simulation Environments</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Learn by doing — adaptive scenarios, focus-locked quizzes, decision points, feedback, and role-aware coaching.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)} disabled={!!selectedDomain || quizState === "taking"}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
            </Select>
            <Select value={mode} onValueChange={(v: Mode) => setMode(v)} disabled={!!selectedDomain || quizState !== "idle"}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="guided">Guided coach</SelectItem><SelectItem value="branching">Branching choices</SelectItem><SelectItem value="interview">Interview mode</SelectItem></SelectContent>
            </Select>
            {(selectedDomain || quizState !== "idle") && <Button variant="outline" onClick={reset} className="gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> New Simulation</Button>}
          </div>
        </div>
      </div>

      {quizState !== "idle" ? renderQuizPanel() : !selectedDomain ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 animate-slide-up">
            <button onClick={openQuizMe} className="relative overflow-hidden study-card p-5 text-left group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2 border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/5" />
              <div className="relative"><div className="flex items-start justify-between mb-4"><div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 ring-4 ring-primary/15"><FileQuestion className="w-6 h-6 text-primary" /></div><Lock className="w-5 h-5 opacity-50 text-primary" /></div><h3 className="font-semibold text-lg mb-1">Quiz Me</h3><p className="text-sm text-muted-foreground min-h-[40px]">Fullscreen document quiz with MCQ, short answers, scoring, and saved focus report.</p><div className="flex flex-wrap gap-1.5 mt-4"><Badge variant="secondary" className="text-[10px]">Focus Lock</Badge><Badge variant="secondary" className="text-[10px]">Saved report</Badge></div><div className="mt-5 flex items-center justify-between text-sm font-medium text-primary"><span>Start Quiz</span><span className="group-hover:translate-x-1 transition-transform inline-block">→</span></div></div>
            </button>
            {DOMAINS.map((domain, i) => {
              const Icon = domain.icon;
              const AccentIcon = domain.accentIcon;
              return <button key={domain.id} onClick={() => startSimulation(domain.id)} className={cn("relative overflow-hidden study-card p-5 text-left group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2", domain.border)} style={{ animationDelay: `${i * 0.07}s` }}><div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", domain.gradient)} /><div className="relative"><div className="flex items-start justify-between mb-4"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ring-4", domain.bg, domain.ring)}><Icon className={cn("w-6 h-6", domain.color)} /></div><AccentIcon className={cn("w-5 h-5 opacity-40", domain.color)} /></div><h3 className="font-semibold text-lg mb-1">{domain.label}</h3><p className="text-sm text-muted-foreground min-h-[40px]">{domain.description}</p><div className="flex flex-wrap gap-1.5 mt-4">{domain.skills.map((skill) => <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>)}</div><div className="mt-5 flex items-center justify-between text-sm font-medium text-primary"><span>Start Simulation</span><span className="group-hover:translate-x-1 transition-transform inline-block">→</span></div></div></button>;
            })}
          </div>

          <div className="study-card p-5 border-2 border-violet-200 dark:border-violet-800/70 animate-fade-in">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end"><div className="flex-1"><div className="flex items-center gap-2 mb-2"><Wand2 className="w-4 h-4 text-violet-500" /><h3 className="font-semibold">Custom Simulation</h3><Badge variant="outline">Any subject</Badge></div><div className="grid gap-3 md:grid-cols-2"><input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="Subject, e.g. Organic Chemistry, Real Estate, Constitutional Law" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" /><input value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} placeholder="Goal, e.g. quiz me on reaction mechanisms" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div></div><Button onClick={() => startSimulation("custom")} className="gap-2"><Wand2 className="w-4 h-4" /> Start Custom</Button></div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] animate-fade-in">
          <aside className="space-y-4">
            {activeDomain && <div className={cn("study-card p-5 border-2", activeDomain.border)}><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", activeDomain.bg)}><activeDomain.icon className={cn("w-6 h-6", activeDomain.color)} /></div><h2 className="font-semibold text-lg">{activeDomain.label}</h2><p className="text-sm text-muted-foreground mt-1">{activeDomain.description}</p><div className="grid grid-cols-2 gap-2 mt-4"><div className="rounded-xl bg-muted/50 p-3"><Target className="w-4 h-4 text-primary mb-1" /><p className="text-lg font-bold">{score.decisions}</p><p className="text-[11px] text-muted-foreground">decisions</p></div><div className="rounded-xl bg-muted/50 p-3"><Trophy className="w-4 h-4 text-primary mb-1" /><p className="text-lg font-bold">{score.feedback}</p><p className="text-[11px] text-muted-foreground">feedback rounds</p></div></div><div className="mt-4 space-y-2 text-xs text-muted-foreground"><div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {difficulty} difficulty</div><div className="flex items-center gap-2"><GitBranch className="w-3.5 h-3.5 text-primary" /> {mode.replace("_", " ")} mode</div></div></div>}
            <div className="study-card p-4"><p className="font-semibold text-sm mb-3">Quick responses</p><div className="space-y-2">{QUICK_RESPONSES.map((quick) => <button key={quick} onClick={() => sendMessage(quick)} disabled={simulationMut.isPending} className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-muted transition-colors disabled:opacity-50">{quick}</button>)}</div></div>
          </aside>

          <div className="study-card flex flex-col h-[680px] overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">{activeDomain && <><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeDomain.bg)}><activeDomain.icon className={cn("w-5 h-5", activeDomain.color)} /></div><div><p className="font-semibold text-sm">{activeDomain.label} Simulation</p><p className="text-xs text-muted-foreground">Respond, choose, ask questions, or request feedback</p></div></>}<Badge variant="secondary" className="ml-auto text-xs">Active</Badge></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.map((msg, i) => <div key={i} className={cn("flex gap-3 animate-slide-up", msg.role === "user" && "flex-row-reverse")}><div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", msg.role === "assistant" ? "bg-primary/10" : "bg-muted")}>{msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}</div><div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm", msg.role === "assistant" ? "bg-muted rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm")}>{msg.role === "assistant" ? <div className="streamdown-content"><MarkdownView>{msg.content}</MarkdownView></div> : <p className="whitespace-pre-wrap">{msg.content}</p>}</div></div>)}{simulationMut.isPending && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-primary" /></div><div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3"><div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div></div></div>}<div ref={messagesEndRef} /></div>
            <div className="p-4 border-t border-border bg-card"><div className="flex gap-2"><Textarea placeholder="Make a decision, explain your reasoning, ask for data, or choose A/B/C/D..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} className="resize-none min-h-[46px] max-h-[140px]" rows={1} /><Button onClick={() => sendMessage()} disabled={!input.trim() || simulationMut.isPending} size="icon" className="h-11 w-11 flex-shrink-0">{simulationMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button></div><p className="text-xs text-muted-foreground mt-2">Press Enter to send · Shift+Enter for new line</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
