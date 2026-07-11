// Signature hero visual for the marketing site: a small, hand-placed knowledge
// graph that shows — literally, not metaphorically — what CourseGraph does.
// Dim nodes are untouched topics, amber rings are in progress, filled nodes
// (with a soft glow) are mastered. One edge is animated to show the system
// pointing at the next recommended topic. This is the one bold element on
// the page; everything else around it stays quiet on purpose.

interface Node {
  id: string;
  x: number;
  y: number;
  r: number;
  state: "mastered" | "inProgress" | "notStarted";
  label: string;
}

const nodes: Node[] = [
  { id: "n1", x: 62, y: 88, r: 13, state: "mastered", label: "Cell structure" },
  { id: "n2", x: 190, y: 46, r: 12, state: "mastered", label: "Mitosis" },
  { id: "n3", x: 314, y: 96, r: 12, state: "inProgress", label: "Meiosis" },
  { id: "n4", x: 96, y: 214, r: 14, state: "notStarted", label: "Genetics" },
  { id: "n5", x: 234, y: 208, r: 13, state: "inProgress", label: "Mendelian traits" },
  { id: "n6", x: 350, y: 246, r: 15, state: "notStarted", label: "Pedigree analysis" },
  { id: "n7", x: 168, y: 330, r: 14, state: "notStarted", label: "Punnett squares" },
];

const edges: [string, string][] = [
  ["n1", "n2"], ["n2", "n3"], ["n1", "n4"], ["n2", "n5"],
  ["n3", "n5"], ["n4", "n5"], ["n5", "n7"], ["n4", "n7"],
];

// The one edge the system is actively recommending right now.
const recommendedEdge: [string, string] = ["n5", "n6"];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

export function MasteryGraphHero({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 380"
      className={className}
      role="img"
      aria-label="Diagram of a course knowledge graph: some topics mastered, some in progress, and one recommended next topic connected by a highlighted path."
    >
      <defs>
        <filter id="mg-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Static edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={byId[a].x} y1={byId[a].y}
          x2={byId[b].x} y2={byId[b].y}
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
      ))}

      {/* Recommended path — the one animated element on the page */}
      <line
        x1={byId[recommendedEdge[0]].x} y1={byId[recommendedEdge[0]].y}
        x2={byId[recommendedEdge[1]].x} y2={byId[recommendedEdge[1]].y}
        stroke="var(--color-secondary)"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        strokeLinecap="round"
        className="mg-recommended-edge"
      />

      {nodes.map((n) => {
        if (n.state === "mastered") {
          return (
            <circle
              key={n.id}
              cx={n.x} cy={n.y} r={n.r}
              fill="var(--color-primary)"
              filter="url(#mg-glow)"
            >
              <title>{n.label} — mastered</title>
            </circle>
          );
        }
        if (n.state === "inProgress") {
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={n.r} fill="var(--color-card)" stroke="var(--color-secondary)" strokeWidth="2.5" />
              <path
                d={`M ${n.x} ${n.y - n.r} A ${n.r} ${n.r} 0 0 1 ${n.x + n.r * 0.95} ${n.y - n.r * 0.3}`}
                fill="var(--color-secondary)"
              />
              <title>{n.label} — in progress</title>
            </g>
          );
        }
        return (
          <circle
            key={n.id}
            cx={n.x} cy={n.y} r={n.r}
            fill="var(--color-card)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          >
            <title>{n.label} — not started</title>
          </circle>
        );
      })}
    </svg>
  );
}
