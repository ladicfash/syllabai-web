import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
// @ts-ignore
import cose from "cytoscape-cose-bilkent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

cytoscape.use(cose as any);

interface Topic {
  id: string;
  name: string;
  description: string;
  completed?: boolean;
  inProgress?: boolean;
}

interface CourseGraphInteractiveProps {
  courseId: string;
  courseName: string;
  topics: Topic[];
  onTopicClick?: (topicId: string) => void;
}

export function CourseGraphInteractive({
  courseId,
  courseName,
  topics,
  onTopicClick,
}: CourseGraphInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || topics.length === 0) return;

    // Create nodes: central course node + topic nodes
    const nodes = [
      {
        data: {
          id: courseId,
          label: courseName,
          type: "course",
        },
      },
      ...topics.map((topic) => ({
        data: {
          id: topic.id,
          label: topic.name,
          description: topic.description,
          type: "topic",
          completed: topic.completed,
          inProgress: topic.inProgress,
        },
      })),
    ];

    // Create edges: course -> each topic
    const edges = topics.map((topic) => ({
      data: {
        source: courseId,
        target: topic.id,
      },
    }));

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node[type='course']",
          style: {
            "background-color": "oklch(0.45 0.2 220)",
            "border-width": 3,
            "border-color": "oklch(0.55 0.25 220)",
            width: 80,
            height: 80,
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": 14,
            "font-weight": "bold",
            color: "white",
            "text-background-color": "rgba(0,0,0,0.5)",
            "text-background-padding": 4,
            "text-background-shape": "round",
          } as any,
        },
        {
          selector: "node[type='topic']",
          style: {
            "background-color": "oklch(0.5 0.15 200)",
            width: 60,
            height: 60,
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": 12,
            color: "white",
            "text-background-color": "rgba(0,0,0,0.4)",
            "text-background-padding": 3,
            "text-background-shape": "round",
            "border-width": 2,
            "border-color": "oklch(0.6 0.15 210)",
          } as any,
        },
        {
          selector: "node[type='topic'][completed]",
          style: {
            "background-color": "oklch(0.55 0.15 120)",
            "border-color": "oklch(0.65 0.2 120)",
          } as any,
        },
        {
          selector: "node[type='topic'][inProgress]",
          style: {
            "background-color": "oklch(0.5 0.2 50)",
            "border-color": "oklch(0.6 0.25 50)",
          } as any,
        },
        {
          selector: "node:hover",
          style: {
            "border-width": 3,
          } as any,
        },
        {
          selector: "edge",
          style: {
            "line-color": "rgba(100, 150, 255, 0.3)",
            width: 2,
            "target-arrow-color": "rgba(100, 150, 255, 0.3)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "cose-bilkent",
        animate: true,
        animationDuration: 800,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 4500,
        nodeOverlap: 10,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        initialEnergyOnIncremental: 0.5,
      } as any,
      wheelSensitivity: 0.1,
      boxSelectionEnabled: true,
      autounselectify: false,
    });

    cyRef.current = cy;

    // Handle node click
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      if (node.data("type") === "topic") {
        const topic = topics.find((t) => t.id === node.id());
        if (topic) {
          setSelectedTopic(topic);
          onTopicClick?.(topic.id);
        }
      }
    });

    // Handle node hover
    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      if (node.data("type") === "topic") {
        setHoveredTopic(node.id());
      }
    });

    cy.on("mouseout", "node", () => {
      setHoveredTopic(null);
    });

    // Handle background click to deselect
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedTopic(null);
      }
    });

    return () => {
      cy.destroy();
    };
  }, [courseId, courseName, topics, onTopicClick]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Graph Container */}
      <div
        ref={containerRef}
        className="flex-1 rounded-lg border border-border bg-slate-950 overflow-hidden"
        style={{ minHeight: "500px" }}
      />

      {/* Hover Tooltip */}
      {hoveredTopic && (
        <div className="fixed bottom-4 left-4 bg-slate-900 border border-slate-700 rounded-lg p-3 max-w-xs shadow-lg z-10">
          {(() => {
            const topic = topics.find((t) => t.id === hoveredTopic);
            return topic ? (
              <div>
                <h4 className="font-semibold text-white text-sm">{topic.name}</h4>
                <p className="text-slate-400 text-xs mt-1">{topic.description}</p>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Selected Topic Panel */}
      {selectedTopic && (
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{selectedTopic.name}</h3>
              <p className="text-slate-400 text-sm mt-2">{selectedTopic.description}</p>
              <div className="flex gap-2 mt-4">
                {selectedTopic.completed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    ✓ Completed
                  </span>
                ) : selectedTopic.inProgress ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                    ◐ In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-medium">
                    ○ Not Started
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-xs text-slate-500 px-2">
        Drag nodes • Scroll to zoom • Click to select • Hover for details
      </div>
    </div>
  );
}
