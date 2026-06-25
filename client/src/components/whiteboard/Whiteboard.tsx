/**
 * Whiteboard (GoodNotes-lite) — infinite grid, free-hand pen, eraser, shapes,
 * color picker, stroke width, undo/redo, save-as-note and PNG export.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Pen, Eraser, Square, Circle as CircleIcon, Minus as LineIcon, MoveRight,
  Trash2, Undo2, Redo2, Download, Save, ZoomIn, ZoomOut, Maximize2, Hand,
  Palette, Grid3x3
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = "pen" | "eraser" | "rect" | "ellipse" | "line" | "arrow" | "pan";

export type Stroke = {
  id: string;
  kind: "stroke";
  color: string;
  width: number;
  points: { x: number; y: number }[];
};

export type Shape = {
  id: string;
  kind: "shape";
  shape: "rect" | "ellipse" | "line" | "arrow";
  color: string;
  width: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type BoardObject = Stroke | Shape;

export type WhiteboardSnapshot = {
  version: 1;
  objects: BoardObject[];
  background: "grid" | "blank" | "dots";
};

const PALETTE = ["#1f2937","#dc2626","#ea580c","#ca8a04","#16a34a","#0891b2","#2563eb","#7c3aed","#db2777","#f5f5f5"];
const GRID_SIZE = 28;

function makeId() { return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(-4); }
function dist(a: {x:number;y:number}, b: {x:number;y:number}) { return Math.hypot(a.x-b.x, a.y-b.y); }
function bbox(o: BoardObject) {
  if (o.kind === "stroke") {
    let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    for (const p of o.points) { if(p.x<minX)minX=p.x; if(p.y<minY)minY=p.y; if(p.x>maxX)maxX=p.x; if(p.y>maxY)maxY=p.y; }
    if (!isFinite(minX)) return null;
    return { x: minX, y: minY, w: maxX-minX, h: maxY-minY };
  }
  return { x: Math.min(o.x1,o.x2), y: Math.min(o.y1,o.y2), w: Math.abs(o.x2-o.x1), h: Math.abs(o.y2-o.y1) };
}

export interface WhiteboardProps {
  initialData?: WhiteboardSnapshot | null;
  onSave?: (snapshot: WhiteboardSnapshot, preview: string) => void;
  height?: number;
}

export default function Whiteboard({ initialData, onSave, height = 560 }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [objects, setObjects] = useState<BoardObject[]>(initialData?.objects ?? []);
  const [background, setBackground] = useState<"grid" | "blank" | "dots">(initialData?.background ?? "grid");
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>("#1f2937");
  const [width, setWidth] = useState<number>(3);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{x:number;y:number}>({x:0,y:0});
  const [history, setHistory] = useState<BoardObject[][]>([]);
  const [future, setFuture] = useState<BoardObject[][]>([]);
  const [showPalette, setShowPalette] = useState(false);

  const drawingRef = useRef<{active: boolean; object?: BoardObject; last?: {x:number;y:number}}>({ active: false });
  const panRef = useRef<{active: boolean; start: {x:number;y:number;panX:number;panY:number} | null}>({ active: false, start: null });

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    return { x: (sx - rect.left - pan.x) / zoom, y: (sy - rect.top - pan.y) / zoom };
  }, [pan.x, pan.y, zoom]);

  const pushHistory = useCallback((prev: BoardObject[]) => {
    setHistory((h) => [...h, prev].slice(-50));
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setFuture((f) => [...f, objects]);
      setObjects(last);
      return h.slice(0, -1);
    });
  }, [objects]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const last = f[f.length - 1];
      setHistory((h) => [...h, objects]);
      setObjects(last);
      return f.slice(0, -1);
    });
  }, [objects]);

  const clearAll = useCallback(() => {
    if (objects.length === 0) return;
    if (!confirm("Clear the entire board? This cannot be undone beyond your redo history.")) return;
    pushHistory(objects);
    setObjects([]);
  }, [objects, pushHistory]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    if (background === "grid") drawGrid(ctx, w, h, pan, zoom);
    else if (background === "dots") drawDots(ctx, w, h, pan, zoom);
    for (const obj of objects) drawObject(ctx, obj);
    const cur = drawingRef.current.object;
    if (drawingRef.current.active && cur) drawObject(ctx, cur);
    ctx.restore();
  }, [objects, pan, zoom, background]);

  useEffect(() => { redraw(); }, [redraw]);
  useEffect(() => {
    const onResize = () => redraw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [redraw]);

  const beginDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "pan") return;
    const w = screenToWorld(e.clientX, e.clientY);
    drawingRef.current.active = true;
    drawingRef.current.last = w;
    if (tool === "pen" || tool === "eraser") {
      drawingRef.current.object = {
        id: makeId(), kind: "stroke",
        color: tool === "eraser" ? "#ffffff" : color,
        width: tool === "eraser" ? Math.max(8, width * 3) : width,
        points: [w],
      };
    } else {
      drawingRef.current.object = {
        id: makeId(), kind: "shape", shape: tool,
        color, width, x1: w.x, y1: w.y, x2: w.x, y2: w.y,
      };
    }
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch {}
    redraw();
  }, [tool, color, width, screenToWorld, redraw]);

  const continueDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active || !drawingRef.current.object) return;
    const w = screenToWorld(e.clientX, e.clientY);
    const obj = drawingRef.current.object;
    if (obj.kind === "stroke") {
      const last = obj.points[obj.points.length - 1];
      if (dist(last, w) < 0.75) return;
      obj.points.push(w);
    } else {
      obj.x2 = w.x; obj.y2 = w.y;
    }
    drawingRef.current.last = w;
    redraw();
  }, [screenToWorld, redraw]);

  const endDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active) return;
    const obj = drawingRef.current.object;
    if (obj) {
      const box = bbox(obj);
      const tooSmall = !box || (box.w < 1.5 && box.h < 1.5);
      if (obj.kind === "stroke" && obj.points.length < 2) {
        drawingRef.current = { active: false };
        redraw();
        return;
      }
      if (tooSmall) {
        drawingRef.current = { active: false };
        redraw();
        return;
      }
      pushHistory(objects);
      setObjects((prev) => [...prev, obj]);
    }
    drawingRef.current = { active: false };
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    redraw();
  }, [objects, pushHistory, redraw]);

  const beginPan = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool !== "pan") return;
    panRef.current.active = true;
    panRef.current.start = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch {}
  }, [tool, pan.x, pan.y]);

  const continuePan = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!panRef.current.active || !panRef.current.start) return;
    const s = panRef.current.start;
    setPan({ x: s.panX + (e.clientX - s.x), y: s.panY + (e.clientY - s.y) });
  }, []);

  const endPan = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!panRef.current.active) return;
    panRef.current = { active: false, start: null };
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  const exportPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
    toast.success("PNG saved to your downloads.");
  }, []);

  const handleSave = useCallback(() => {
    if (!onSave) return;
    const snapshot: WhiteboardSnapshot = { version: 1, objects, background };
    const canvas = canvasRef.current;
    const preview = canvas ? canvas.toDataURL("image/png") : "";
    onSave(snapshot, preview);
  }, [objects, background, onSave]);

  const setZoomAround = (next: number) => {
    const canvas = canvasRef.current;
    if (!canvas) { setZoom(next); return; }
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const wx = (cx - pan.x) / zoom;
    const wy = (cy - pan.y) / zoom;
    setPan({ x: cx - wx * next, y: cy - wy * next });
    setZoom(Math.max(0.25, Math.min(4, next)));
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (e.key === "0") resetView();
      else if (e.key === "+" || e.key === "=") setZoomAround(zoom * 1.2);
      else if (e.key === "-") setZoomAround(zoom / 1.2);
      else if (e.key === "p") setTool("pen");
      else if (e.key === "e") setTool("eraser");
      else if (e.key === "r") setTool("rect");
      else if (e.key === "o") setTool("ellipse");
      else if (e.key === "l") setTool("line");
      else if (e.key === "a") setTool("arrow");
      else if (e.key === "h") setTool("pan");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, undo, redo]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "pan") beginPan(e); else beginDraw(e);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "pan") continuePan(e); else continueDraw(e);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "pan") endPan(e); else endDraw(e);
  };

  const cursorClass = tool === "pan" ? "cursor-grab active:cursor-grabbing" : tool === "eraser" ? "cursor-cell" : "cursor-crosshair";
  const toolBtn = (id: Tool, label: string, Icon: any, keyHint: string) => (
    <button
      key={id}
      onClick={() => setTool(id)}
      title={`${label} (${keyHint})`}
      className={cn(
        "h-9 w-9 rounded-md flex items-center justify-center transition-colors",
        tool === id ? "bg-primary text-primary-foreground shadow" : "bg-muted/60 hover:bg-muted text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap rounded-xl border bg-card p-2 shadow-sm">
        <div className="flex items-center gap-1">
          {toolBtn("pen", "Pen", Pen, "P")}
          {toolBtn("eraser", "Eraser", Eraser, "E")}
          <div className="mx-1 h-6 w-px bg-border" />
          {toolBtn("rect", "Rectangle", Square, "R")}
          {toolBtn("ellipse", "Ellipse", CircleIcon, "O")}
          {toolBtn("line", "Line", LineIcon, "L")}
          {toolBtn("arrow", "Arrow", MoveRight, "A")}
          <div className="mx-1 h-6 w-px bg-border" />
          {toolBtn("pan", "Pan / Move", Hand, "H")}
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <div className="relative">
          <button
            onClick={() => setShowPalette((v) => !v)}
            className="h-9 px-2 rounded-md bg-muted/60 hover:bg-muted flex items-center gap-2"
            title="Color"
          >
            <Palette className="w-4 h-4" />
            <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
          </button>
          {showPalette && (
            <div className="absolute z-20 mt-1 left-0 rounded-lg border bg-card p-2 shadow-lg grid grid-cols-5 gap-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setShowPalette(false); if (tool === "eraser") setTool("pen"); }}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <div className="col-span-5 flex items-center gap-2 pt-1">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-7 w-7 rounded cursor-pointer border" />
                <span className="text-xs font-mono text-muted-foreground">{color}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 min-w-[160px]">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Width</span>
          <Slider value={[width]} min={1} max={20} step={1} onValueChange={(v) => setWidth(v[0])} className="w-32" />
          <span className="text-xs font-mono text-muted-foreground w-6 text-right">{width}</span>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <button onClick={() => setBackground("grid")} title="Grid background"
            className={cn("h-9 w-9 rounded-md flex items-center justify-center", background === "grid" ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted")}>
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button onClick={() => setBackground("dots")} title="Dotted background"
            className={cn("h-9 px-2 rounded-md text-xs", background === "dots" ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted")}>...</button>
          <button onClick={() => setBackground("blank")} title="Blank background"
            className={cn("h-9 px-2 rounded-md text-xs", background === "blank" ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted")}>Blank</button>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"
            className="h-9 w-9 rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center disabled:opacity-40">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Shift+Z)"
            className="h-9 w-9 rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center disabled:opacity-40">
            <Redo2 className="w-4 h-4" />
          </button>
          <button onClick={clearAll} disabled={objects.length === 0} title="Clear all"
            className="h-9 w-9 rounded-md bg-muted/60 hover:bg-destructive/20 hover:text-destructive flex items-center justify-center disabled:opacity-40">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setZoomAround(zoom / 1.2)} title="Zoom out (-)"
            className="h-9 w-9 rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={resetView} title="Reset view (0)"
            className="h-9 px-2 rounded-md bg-muted/60 hover:bg-muted flex items-center gap-1 text-xs">
            <Maximize2 className="w-3.5 h-3.5" />
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => setZoomAround(zoom * 1.2)} title="Zoom in (+)"
            className="h-9 w-9 rounded-md bg-muted/60 hover:bg-muted flex items-center justify-center">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl border bg-card overflow-hidden shadow-sm" style={{ height }}>
        <canvas
          ref={canvasRef}
          className={cn("w-full h-full touch-none select-none", cursorClass)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={(e) => {
            if (drawingRef.current.active) endDraw(e);
            if (panRef.current.active) endPan(e);
          }}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-background/80 border px-2.5 py-1 text-[10px] text-muted-foreground">
          {objects.length} object{objects.length === 1 ? "" : "s"}
          <span className="mx-1 opacity-50">·</span>
          Pan with <kbd className="font-mono">H</kbd>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {onSave && (
            <Button size="sm" variant="default" onClick={handleSave} className="gap-1.5 shadow">
              <Save className="w-3.5 h-3.5" /> Save as Note
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={exportPng} className="gap-1.5 bg-background/80">
            <Download className="w-3.5 h-3.5" /> Export PNG
          </Button>
        </div>
      </div>
    </div>
  );
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, pan: {x:number;y:number}, zoom: number) {
  const size = GRID_SIZE * zoom;
  const offsetX = ((pan.x % size) + size) % size;
  const offsetY = ((pan.y % size) + size) % size;
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = offsetX; x < w; x += size) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
  for (let y = offsetY; y < h; y += size) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
  ctx.stroke();
}

function drawDots(ctx: CanvasRenderingContext2D, w: number, h: number, pan: {x:number;y:number}, zoom: number) {
  const size = GRID_SIZE * zoom;
  const offsetX = ((pan.x % size) + size) % size;
  const offsetY = ((pan.y % size) + size) % size;
  ctx.fillStyle = "#d1d5db";
  for (let x = offsetX; x < w; x += size) {
    for (let y = offsetY; y < h; y += size) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawObject(ctx: CanvasRenderingContext2D, obj: BoardObject) {
  if (obj.kind === "stroke") {
    if (obj.points.length < 2) return;
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = obj.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(obj.points[0].x, obj.points[0].y);
    for (let i = 1; i < obj.points.length; i++) ctx.lineTo(obj.points[i].x, obj.points[i].y);
    ctx.stroke();
    return;
  }
  ctx.strokeStyle = obj.color;
  ctx.lineWidth = obj.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (obj.shape === "rect") {
    const x = Math.min(obj.x1, obj.x2);
    const y = Math.min(obj.y1, obj.y2);
    const w = Math.abs(obj.x2 - obj.x1);
    const h = Math.abs(obj.y2 - obj.y1);
    ctx.strokeRect(x, y, w, h);
  } else if (obj.shape === "ellipse") {
    const cx = (obj.x1 + obj.x2) / 2;
    const cy = (obj.y1 + obj.y2) / 2;
    const rx = Math.abs(obj.x2 - obj.x1) / 2;
    const ry = Math.abs(obj.y2 - obj.y1) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (obj.shape === "line") {
    ctx.beginPath();
    ctx.moveTo(obj.x1, obj.y1);
    ctx.lineTo(obj.x2, obj.y2);
    ctx.stroke();
  } else if (obj.shape === "arrow") {
    ctx.beginPath();
    ctx.moveTo(obj.x1, obj.y1);
    ctx.lineTo(obj.x2, obj.y2);
    ctx.stroke();
    const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
    const head = Math.max(8, obj.width * 2.5);
    ctx.beginPath();
    ctx.moveTo(obj.x2, obj.y2);
    ctx.lineTo(obj.x2 - head * Math.cos(angle - Math.PI / 6), obj.y2 - head * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(obj.x2, obj.y2);
    ctx.lineTo(obj.x2 - head * Math.cos(angle + Math.PI / 6), obj.y2 - head * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
}

export function renderWhiteboardToPng(snapshot: WhiteboardSnapshot, viewport = { w: 1280, h: 720 }, padding = 40): string {
  const canvas = document.createElement("canvas");
  canvas.width = viewport.w;
  canvas.height = viewport.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const o of snapshot.objects) {
    const b = bbox(o);
    if (!b) continue;
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.w > maxX) maxX = b.x + b.w;
    if (b.y + b.h > maxY) maxY = b.y + b.h;
  }
  if (!isFinite(minX)) {
    minX = 0; minY = 0; maxX = viewport.w - padding * 2; maxY = viewport.h - padding * 2;
  } else {
    minX -= padding; minY -= padding; maxX += padding; maxY += padding;
  }
  const scale = Math.min((viewport.w - padding * 2) / Math.max(1, maxX - minX), (viewport.h - padding * 2) / Math.max(1, maxY - minY), 1);
  const offsetX = padding - minX * scale;
  const offsetY = padding - minY * scale;

  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, viewport.w, viewport.h);

  if (snapshot.background === "grid") {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = (offsetX % GRID_SIZE); x < viewport.w; x += GRID_SIZE) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, viewport.h); }
    for (let y = (offsetY % GRID_SIZE); y < viewport.h; y += GRID_SIZE) { ctx.moveTo(0, y + 0.5); ctx.lineTo(viewport.w, y + 0.5); }
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  for (const o of snapshot.objects) drawObject(ctx, o);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export const EMPTY_WHITEBOARD_SNAPSHOT: WhiteboardSnapshot = { version: 1, objects: [], background: "grid" };
