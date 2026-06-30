import React, { useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  BookOpen,
  Network,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExtractedTopic {
  name: string;
  description: string;
  parentName?: string;
  isRoot: boolean;
  selected: boolean;
}

// ── Step indicators ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Upload Syllabus', icon: Upload },
  { id: 2, label: 'Connect Docs', icon: FileText },
  { id: 3, label: 'Build Graph', icon: Network },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
                )}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground/50'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 mx-2 mt-[-14px] transition-all duration-500',
                  current > step.id ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Upload Syllabus ───────────────────────────────────────────────────

interface Step1Props {
  courseName: string;
  setCourseName: (v: string) => void;
  syllabusFile: File | null;
  setSyllabusFile: (f: File | null) => void;
  syllabusText: string;
  setSyllabusText: (t: string) => void;
}

function Step1Upload({ courseName, setCourseName, syllabusFile, setSyllabusFile, syllabusText, setSyllabusText }: Step1Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  const handleFile = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Please upload a PDF, DOCX, or TXT file.');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error('File must be under 15 MB.');
        return;
      }
      setSyllabusFile(file);
      toast.success(`"${file.name}" ready to process`);
    },
    [setSyllabusFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">{t('courseName')} *</label>
          <Input
            placeholder="e.g. Introduction to Machine Learning"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="text-base"
          />
        </div>
        <LanguageSelector />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Syllabus</label>
        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : syllabusFile
              ? 'border-green-500/60 bg-green-500/5'
              : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {syllabusFile ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="font-semibold text-green-700 dark:text-green-400">{syllabusFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(syllabusFile.size / 1024).toFixed(0)} KB · Click to replace
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={(e) => { e.stopPropagation(); setSyllabusFile(null); }}
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Drop your syllabus here</p>
                <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, or TXT · up to 15 MB</p>
              </div>
              <Button variant="outline" size="sm" className="mt-1">Browse files</Button>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">or paste text directly</span>
        </div>
      </div>

      <div className="space-y-2">
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          placeholder="Paste your syllabus content, course description, or study material here…"
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Step 2: Connect Documents ─────────────────────────────────────────────────

interface DocItem {
  id: number;
  originalName: string;
  mimeType: string;
  wordCount?: number;
  extractedText?: string;
}

interface Step2Props {
  selectedDocIds: Set<number>;
  setSelectedDocIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

function Step2Docs({ selectedDocIds, setSelectedDocIds }: Step2Props) {
  const { data: docs, isLoading } = trpc.documents.list.useQuery();

  const toggle = (id: number) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getIcon = (mime: string) => {
    if (mime === 'application/pdf') return '📄';
    if (mime.includes('word')) return '📝';
    if (mime === 'text/plain') return '📃';
    return '📁';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-700 dark:text-blue-300">Optional: Connect existing documents</p>
          <p className="text-muted-foreground mt-0.5">
            Select notes or documents from your library to enrich the knowledge graph. The AI will use their content alongside your syllabus.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !docs || docs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No documents in your library yet</p>
          <p className="text-sm mt-1">You can skip this step — your syllabus is enough to build the graph.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {(docs as DocItem[]).map((doc) => (
            <label
              key={doc.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                selectedDocIds.has(doc.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
              )}
            >
              <Checkbox
                checked={selectedDocIds.has(doc.id)}
                onCheckedChange={() => toggle(doc.id)}
                className="shrink-0"
              />
              <span className="text-lg">{getIcon(doc.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.originalName}</p>
                {doc.wordCount && (
                  <p className="text-xs text-muted-foreground">{doc.wordCount.toLocaleString()} words</p>
                )}
              </div>
              {selectedDocIds.has(doc.id) && (
                <Badge variant="secondary" className="text-xs shrink-0">Selected</Badge>
              )}
            </label>
          ))}
        </div>
      )}

      {selectedDocIds.size > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedDocIds.size} document{selectedDocIds.size !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

// ── Step 3: Build Graph ───────────────────────────────────────────────────────

interface Step3Props {
  topics: ExtractedTopic[];
  setTopics: React.Dispatch<React.SetStateAction<ExtractedTopic[]>>;
  detectedCourseName: string;
  courseName: string;
  isExtracting: boolean;
  extractError: string | null;
}

function Step3Graph({ topics, setTopics, detectedCourseName, courseName, isExtracting, extractError }: Step3Props) {
  const toggleTopic = (idx: number) => {
    setTopics((prev) => prev.map((t, i) => (i === idx ? { ...t, selected: !t.selected } : t)));
  };

  const selectedCount = topics.filter((t) => t.selected).length;

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">Analysing your syllabus…</p>
          <p className="text-sm text-muted-foreground mt-1">AI is extracting topics and building the knowledge structure</p>
        </div>
      </div>
    );
  }

  if (extractError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-semibold">Topic extraction failed</p>
          <p className="text-sm text-muted-foreground mt-1">{extractError}</p>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
        <Network className="w-10 h-10 opacity-30" />
        <p>Topics will appear here after extraction</p>
      </div>
    );
  }

  const rootTopics = topics.filter((t) => t.isRoot);
  const childTopics = topics.filter((t) => !t.isRoot);

  return (
    <div className="space-y-4">
      {detectedCourseName && detectedCourseName !== courseName && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-amber-700 dark:text-amber-300">
            AI detected course name: <strong>"{detectedCourseName}"</strong>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {topics.length} topics selected
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setTopics((p) => p.map((t) => ({ ...t, selected: true })))}>
            Select all
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setTopics((p) => p.map((t) => ({ ...t, selected: false })))}>
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {/* Root topics */}
        {rootTopics.map((topic, idx) => {
          const globalIdx = topics.indexOf(topic);
          const children = childTopics.filter((c) => c.parentName === topic.name);
          return (
            <div key={idx} className="space-y-1">
              <label
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  topic.selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                )}
              >
                <Checkbox
                  checked={topic.selected}
                  onCheckedChange={() => toggleTopic(globalIdx)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{topic.name}</p>
                    <Badge variant="outline" className="text-xs">Root</Badge>
                  </div>
                  {topic.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{topic.description}</p>
                  )}
                </div>
              </label>

              {/* Children */}
              {children.map((child) => {
                const childIdx = topics.indexOf(child);
                return (
                  <label
                    key={childIdx}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ml-6',
                      child.selected
                        ? 'border-primary/60 bg-primary/3'
                        : 'border-border/60 hover:border-muted-foreground/30 hover:bg-muted/20'
                    )}
                  >
                    <Checkbox
                      checked={child.selected}
                      onCheckedChange={() => toggleTopic(childIdx)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{child.name}</p>
                      {child.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{child.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          );
        })}

        {/* Orphan children (no matching root) */}
        {childTopics
          .filter((c) => !rootTopics.some((r) => r.name === c.parentName))
          .map((topic) => {
            const globalIdx = topics.indexOf(topic);
            return (
              <label
                key={globalIdx}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  topic.selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                )}
              >
                <Checkbox
                  checked={topic.selected}
                  onCheckedChange={() => toggleTopic(globalIdx)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{topic.name}</p>
                  {topic.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{topic.description}</p>
                  )}
                </div>
              </label>
            );
          })}
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export function CourseGraphOnboarding() {
  const [, navigate] = useLocation();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 state
  const [courseName, setCourseName] = useState('');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusText, setSyllabusText] = useState('');

  // Step 2 state
  const [selectedDocIds, setSelectedDocIds] = useState<Set<number>>(new Set());

  // Step 3 state
  const [topics, setTopics] = useState<ExtractedTopic[]>([]);
  const [detectedCourseName, setDetectedCourseName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Building state
  const [isBuilding, setIsBuilding] = useState(false);

  // tRPC
  const { data: docs } = trpc.documents.list.useQuery();
  const extractTopics = trpc.courseGraph.extractTopics.useMutation();
  const createCourse = trpc.courseGraph.createCourse.useMutation();
  const bulkCreateTopics = trpc.courseGraph.bulkCreateTopics.useMutation();
  const utils = trpc.useUtils();

  // ── Navigation ──────────────────────────────────────────────────────────────

  const canGoNext = () => {
    if (step === 1) return courseName.trim().length > 0 && (!!syllabusFile || syllabusText.trim().length > 30);
    if (step === 2) return true; // optional step
    if (step === 3) return topics.filter((t) => t.selected).length > 0;
    return false;
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Trigger extraction then move to step 3
      setStep(3);
      await runExtraction();
    } else if (step === 3) {
      await buildGraph();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // ── Extraction ──────────────────────────────────────────────────────────────

  const runExtraction = async () => {
    setIsExtracting(true);
    setExtractError(null);
    setTopics([]);

    try {
      // Build extra text from selected docs
      let extraText = '';
      if (selectedDocIds.size > 0 && docs) {
        const selected = (docs as any[]).filter((d: any) => selectedDocIds.has(d.id));
        extraText = selected
          .filter((d: any) => d.extractedText)
          .map((d: any) => d.extractedText)
          .join('\n\n')
          .slice(0, 4000);
      }

      let fileBase64: string | undefined;
      let mimeType: string | undefined;
      let filename: string | undefined;

      if (syllabusFile) {
        const arrayBuffer = await syllabusFile.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        fileBase64 = btoa(Array.from(uint8, (b) => String.fromCharCode(b)).join(''));
        mimeType = syllabusFile.type;
        filename = syllabusFile.name;
      }

      const result = await extractTopics.mutateAsync({
        text: syllabusText || undefined,
        fileBase64,
        mimeType,
        filename,
        extraText: extraText || undefined,
      });

      setDetectedCourseName(result.courseName);
      setTopics(
        result.topics.map((t) => ({
          ...t,
          selected: true,
        }))
      );

      // Auto-fill course name if blank
      if (!courseName.trim() && result.courseName) {
        setCourseName(result.courseName);
      }
    } catch (err: any) {
      setExtractError(err?.message ?? 'Failed to extract topics. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Build graph ─────────────────────────────────────────────────────────────

  const buildGraph = async () => {
    const selectedTopics = topics.filter((t) => t.selected);
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic.');
      return;
    }

    setIsBuilding(true);
    try {
      // 1. Create course
      const courseResult = await createCourse.mutateAsync({
        name: courseName.trim(),
        syllabus: syllabusText || undefined,
      });

      if (!courseResult.courseId) {
        throw new Error('Course creation did not return an ID');
      }

      // 2. Bulk-create topics
      await bulkCreateTopics.mutateAsync({
        courseId: courseResult.courseId,
        topics: selectedTopics.map((t) => ({
          name: t.name,
          description: t.description,
          parentName: t.parentName,
        })),
      });

      // 3. Invalidate and navigate
      await utils.courseGraph.getCourses.invalidate();
      toast.success(`"${courseName}" knowledge graph created with ${selectedTopics.length} topics!`);
      navigate('/course-graph');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to build graph. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const progressValue = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            CourseGraph Setup
          </div>
          <h1 className="text-3xl font-bold">Build your first knowledge graph</h1>
          <p className="text-muted-foreground mt-2">
            Upload your syllabus and let AI map your course into a personalized learning graph.
          </p>
        </div>

        {/* Progress bar */}
        <Progress value={progressValue} className="h-1 mb-8" />

        {/* Step indicators */}
        <StepIndicator current={step} />

        {/* Card */}
        <Card className="p-6 shadow-lg border-border/60">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {step === 1 && 'Step 1: Upload your syllabus'}
              {step === 2 && 'Step 2: Connect your documents'}
              {step === 3 && 'Step 3: Review & build your graph'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 && 'Give your course a name and upload the syllabus so AI can extract topics.'}
              {step === 2 && 'Optionally connect existing documents from your library to enrich the graph.'}
              {step === 3 && 'Review the AI-extracted topics and confirm to create your CourseGraph.'}
            </p>
          </div>

          {/* Step content */}
          <div
            key={step}
            style={{
              animation: 'fadeSlideIn 220ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            {step === 1 && (
              <Step1Upload
                courseName={courseName}
                setCourseName={setCourseName}
                syllabusFile={syllabusFile}
                setSyllabusFile={setSyllabusFile}
                syllabusText={syllabusText}
                setSyllabusText={setSyllabusText}
              />
            )}
            {step === 2 && (
              <Step2Docs
                selectedDocIds={selectedDocIds}
                setSelectedDocIds={setSelectedDocIds}
              />
            )}
            {step === 3 && (
              <Step3Graph
                topics={topics}
                setTopics={setTopics}
                detectedCourseName={detectedCourseName}
                courseName={courseName}
                isExtracting={isExtracting}
                extractError={extractError}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={step === 1 ? () => navigate('/course-graph') : handleBack}
              disabled={isBuilding}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center gap-3">
              {step === 2 && (
                <Button variant="ghost" onClick={() => { setStep(3); runExtraction(); }}>
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canGoNext() || isBuilding || isExtracting}
                className="min-w-[140px]"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Building…
                  </>
                ) : step === 3 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Build Graph
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is private and never shared. You can export or delete it anytime from CourseGraph settings.
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default CourseGraphOnboarding;
