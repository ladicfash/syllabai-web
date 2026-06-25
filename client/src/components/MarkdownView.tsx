import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#3b82f6",
            primaryTextColor: "#f1f5f9",
            primaryBorderColor: "#1e40af",
            lineColor: "#64748b",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            background: "#0f172a",
            mainBkg: "#1e293b",
            nodeBorder: "#334155",
            titleColor: "#f1f5f9",
            edgeLabelBackground: "#1e293b",
          },
          securityLevel: "loose",
        });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg: rendered } = await mermaid.render(id, code.trim());
        if (!cancelled) setSvg(rendered);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Diagram render error");
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium mb-1">Diagram render error</p>
        <pre className="text-xs opacity-70 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8 min-h-32">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Rendering diagram…
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="overflow-x-auto rounded-lg border border-border bg-muted/20 p-4 my-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative my-3 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/60 px-3 py-1.5 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || "code"}</span>
        <button onClick={copy} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded hover:bg-muted">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm bg-muted/30">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownView({ children, className }: { children: string; className?: string }) {
  if (!children) return null;
  const trimmed = children.trim();
  // Detect bare Mermaid output (no markdown fences)
  if (
    trimmed.startsWith("mindmap") ||
    trimmed.startsWith("timeline") ||
    trimmed.startsWith("flowchart") ||
    trimmed.startsWith("graph ") ||
    trimmed.startsWith("sequenceDiagram") ||
    trimmed.startsWith("gantt")
  ) {
    return <div className={cn("w-full", className)}><MermaidDiagram code={trimmed} /></div>;
  }

  return (
    <div className={cn("prose prose-sm prose-invert max-w-none leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: cls, children, ...props }) {
            const lang = /language-(\w+)/.exec(cls || "")?.[1];
            const codeStr = String(children).replace(/\n$/, "");
            const isBlock = codeStr.includes("\n") || !!lang;
            if (lang === "mermaid" || (!lang && isBlock && (
              codeStr.startsWith("mindmap") || codeStr.startsWith("timeline") ||
              codeStr.startsWith("flowchart") || codeStr.startsWith("graph ") ||
              codeStr.startsWith("sequenceDiagram")
            ))) {
              return <MermaidDiagram code={codeStr} />;
            }
            if (isBlock) return <CodeBlock code={codeStr} language={lang} />;
            return <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-mono text-primary/90" {...props}>{children}</code>;
          },
          h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground/90">{children}</h3>,
          ul: ({ children }) => <ul className="my-2 space-y-1 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 pl-4 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-foreground/85 flex gap-2"><span className="text-primary mt-1.5 shrink-0">•</span><span>{children}</span></li>,
          p: ({ children }) => <p className="text-sm text-foreground/85 leading-relaxed my-1.5">{children}</p>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-4 my-3 text-sm text-muted-foreground italic">{children}</blockquote>,
          table: ({ children }) => <div className="overflow-x-auto my-3 rounded-lg border border-border"><table className="w-full text-sm">{children}</table></div>,
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-foreground/90 border-b border-border">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-foreground/80 border-b border-border/50">{children}</td>,
          hr: () => <hr className="my-4 border-border/50" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
