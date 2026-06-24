import { cn } from "@/lib/utils";

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export function MarkdownView({ children, className }: { children: string; className?: string }) {
  const lines = (children || "").split("\n");
  return (
    <div className={cn("space-y-2 leading-relaxed", className)}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith("### ")) return <h3 key={i} className="mt-4 text-base font-semibold">{formatInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith("## ")) return <h2 key={i} className="mt-5 text-lg font-bold">{formatInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith("# ")) return <h1 key={i} className="mt-5 text-xl font-bold">{formatInline(trimmed.slice(2))}</h1>;
        if (/^[-*]\s+/.test(trimmed)) return <p key={i} className="pl-4 text-sm"><span className="mr-2 text-primary">•</span>{formatInline(trimmed.replace(/^[-*]\s+/, ""))}</p>;
        if (/^\d+\.\s+/.test(trimmed)) return <p key={i} className="pl-4 text-sm">{formatInline(trimmed)}</p>;
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) return <pre key={i} className="overflow-x-auto rounded bg-muted/50 px-2 py-1 text-xs">{line}</pre>;
        return <p key={i} className="text-sm">{formatInline(line)}</p>;
      })}
    </div>
  );
}
