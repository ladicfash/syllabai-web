import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FlaskConical, TrendingUp, Code2, Landmark, Send, RotateCcw, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";

type Domain = "medical" | "finance" | "coding" | "history";

const DOMAINS = [
  {
    id: "medical" as Domain,
    label: "Medical",
    icon: FlaskConical,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    description: "Clinical case scenarios and diagnostic reasoning",
    starter: "Present me with a challenging clinical case involving a patient with chest pain and shortness of breath.",
  },
  {
    id: "finance" as Domain,
    label: "Finance",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    description: "Investment decisions and market analysis",
    starter: "Present a portfolio allocation scenario for a 30-year-old investor with moderate risk tolerance.",
  },
  {
    id: "coding" as Domain,
    label: "Coding",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    description: "Technical interviews and system design",
    starter: "Give me a medium-difficulty algorithm problem and evaluate my approach.",
  },
  {
    id: "history" as Domain,
    label: "History",
    icon: Landmark,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    description: "What-if historical scenarios and analysis",
    starter: "Present a what-if scenario: What if the printing press was never invented? Walk me through the analysis.",
  },
];

type Message = { role: "user" | "assistant"; content: string };

export default function Simulations() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [scenario, setScenario] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const simulationMut = trpc.ai.simulation.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSimulation = async (domain: Domain) => {
    setSelectedDomain(domain);
    setMessages([]);
    const d = DOMAINS.find(d => d.id === domain)!;
    setScenario(d.starter);
    try {
      const result = await simulationMut.mutateAsync({
        domain,
        scenario: d.starter,
        conversationHistory: [],
      });
      setMessages([{ role: "assistant", content: result.response }]);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start simulation");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedDomain) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    try {
      const result = await simulationMut.mutateAsync({
        domain: selectedDomain,
        scenario,
        userResponse: input,
        conversationHistory: messages,
      });
      setMessages([...newMessages, { role: "assistant", content: result.response }]);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to get response");
    }
  };

  const reset = () => {
    setSelectedDomain(null);
    setMessages([]);
    setInput("");
    setScenario("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold font-serif">Simulation Environments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Learn by doing — AI-powered role-aware scenarios</p>
        </div>
        {selectedDomain && (
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> New Simulation
          </Button>
        )}
      </div>

      {!selectedDomain ? (
        /* Domain Selection */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
          {DOMAINS.map((domain, i) => (
            <button
              key={domain.id}
              onClick={() => startSimulation(domain.id)}
              className={cn("study-card p-6 text-left group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2", domain.border)}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", domain.bg)}>
                <domain.icon className={cn("w-6 h-6", domain.color)} />
              </div>
              <h3 className="font-semibold text-lg mb-1">{domain.label}</h3>
              <p className="text-sm text-muted-foreground">{domain.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Start Simulation <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Chat Interface */
        <div className="study-card flex flex-col h-[600px] animate-fade-in">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            {(() => {
              const d = DOMAINS.find(d => d.id === selectedDomain)!;
              return (
                <>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", d.bg)}>
                    <d.icon className={cn("w-4.5 h-4.5", d.color)} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{d.label} Simulation</p>
                    <p className="text-xs text-muted-foreground">AI-powered scenario</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
                </>
              );
            })()}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 animate-slide-up", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", msg.role === "assistant" ? "bg-primary/10" : "bg-muted")}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm", msg.role === "assistant" ? "bg-muted rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm")}>
                  {msg.role === "assistant" ? (
                    <div className="streamdown-content">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {simulationMut.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                placeholder="Respond to the scenario..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                className="resize-none min-h-[44px] max-h-[120px]"
                rows={1}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || simulationMut.isPending} size="icon" className="h-11 w-11 flex-shrink-0">
                {simulationMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </div>
  );
}
