'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import { Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

/* ---------- Types ---------- */

type NodeType =
  | 'page'
  | 'component'
  | 'token'
  | 'style-pack'
  | 'project'
  | 'route'
  | 'api-endpoint';
type EdgeType =
  | 'uses'
  | 'contains'
  | 'links-to'
  | 'styled-by'
  | 'derives-from'
  | 'overrides'
  | 'imports';

interface ApiGraphNode {
  id: string;
  label: string;
  nodeType: NodeType;
  metadata?: Record<string, unknown>;
}

interface ApiGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  label?: string | null;
}

interface ApiGraphData {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
}

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
}

interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function transformApiData(data: ApiGraphData): GraphData {
  return {
    nodes: data.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.nodeType,
    })),
    edges: data.edges.map((e) => ({
      source: e.sourceNodeId,
      target: e.targetNodeId,
      type: e.edgeType,
    })),
  };
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: EdgeType;
}

/* ---------- Constants ---------- */

const NODE_COLORS: Record<NodeType, string> = {
  page: '#06B6D4',
  component: '#84CC16',
  token: '#A1A1AA',
  'style-pack': '#F59E0B',
  project: '#FFFFFF',
  route: '#8B5CF6',
  'api-endpoint': '#EC4899',
};

const NODE_SIZES: Record<NodeType, number> = {
  page: 8,
  component: 6,
  token: 4,
  'style-pack': 10,
  project: 12,
  route: 6,
  'api-endpoint': 6,
};

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  page: 'Page',
  component: 'Component',
  token: 'Token',
  'style-pack': 'Style Pack',
  project: 'Project',
  route: 'Route',
  'api-endpoint': 'API Endpoint',
};

const EDGE_COLORS: Record<EdgeType, string> = {
  uses: 'rgba(161,161,170,0.4)',
  contains: 'rgba(161,161,170,0.35)',
  'links-to': 'rgba(161,161,170,0.3)',
  'styled-by': 'rgba(132,204,22,0.5)',
  'derives-from': 'rgba(139,92,246,0.4)',
  overrides: 'rgba(239,68,68,0.4)',
  imports: 'rgba(6,182,212,0.4)',
};

/* ---------- Component ---------- */

interface ProjectGraphProps {
  projectId: string;
}

export function ProjectGraph({ projectId }: ProjectGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startCamX: number;
    startCamY: number;
    draggedNode: SimNode | null;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startCamX: 0,
    startCamY: 0,
    draggedNode: null,
  });

  // Simulation data refs
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  /* ---------- Fetch data ---------- */

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/graph`);
      if (res.status === 404) {
        setGraphData({ nodes: [], edges: [] });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch graph');
      const raw: ApiGraphData = await res.json();
      setGraphData(transformApiData(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const generateGraph = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/graph`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate graph');
      const raw: ApiGraphData = await res.json();
      setGraphData(transformApiData(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  /* ---------- Simulation ---------- */

  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) return;

    const nodes: SimNode[] = graphData.nodes.map((n) => ({
      ...n,
      x: undefined,
      y: undefined,
    }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links: SimLink[] = graphData.edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        type: e.type,
      }));

    nodesRef.current = nodes;
    linksRef.current = links;

    const sim = forceSimulation(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(0, 0))
      .force(
        'collide',
        forceCollide<SimNode>().radius((d) => NODE_SIZES[d.type] + 4)
      )
      .alphaDecay(0.02);

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [graphData]);

  /* ---------- Rendering ---------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    const render = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cam = cameraRef.current;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2 + cam.x, h / 2 + cam.y);
      ctx.scale(cam.zoom, cam.zoom);

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Connected node IDs for hover highlighting
      const connectedIds = new Set<string>();
      if (hoveredNode) {
        connectedIds.add(hoveredNode.id);
        for (const link of links) {
          const s = link.source as SimNode;
          const t = link.target as SimNode;
          if (s.id === hoveredNode.id) connectedIds.add(t.id);
          if (t.id === hoveredNode.id) connectedIds.add(s.id);
        }
      }

      // Draw edges
      for (const link of links) {
        const s = link.source as SimNode;
        const t = link.target as SimNode;
        if (s.x == null || s.y == null || t.x == null || t.y == null) continue;

        const dimmed = hoveredNode && !connectedIds.has(s.id) && !connectedIds.has(t.id);
        const baseColor = EDGE_COLORS[link.type];

        ctx.beginPath();
        ctx.strokeStyle = dimmed ? 'rgba(63,63,70,0.2)' : baseColor;
        ctx.lineWidth = 1;

        if (link.type === 'contains') {
          ctx.setLineDash([4, 4]);
        } else if (link.type === 'links-to') {
          ctx.setLineDash([2, 4]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();

        // Arrow for links-to
        if (link.type === 'links-to') {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            const arrowLen = 6;
            const angle = Math.atan2(dy, dx);
            const targetRadius = NODE_SIZES[t.type] + 2;
            const ax = t.x - (dx / len) * targetRadius;
            const ay = t.y - (dy / len) * targetRadius;

            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.fillStyle = dimmed ? 'rgba(63,63,70,0.2)' : baseColor;
            ctx.moveTo(ax, ay);
            ctx.lineTo(
              ax - arrowLen * Math.cos(angle - Math.PI / 6),
              ay - arrowLen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              ax - arrowLen * Math.cos(angle + Math.PI / 6),
              ay - arrowLen * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
        }

        ctx.setLineDash([]);
      }

      // Draw nodes
      for (const node of nodes) {
        if (node.x == null || node.y == null) continue;

        const r = NODE_SIZES[node.type];
        const color = NODE_COLORS[node.type];
        const dimmed = hoveredNode && !connectedIds.has(node.id);
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Glow effect on hover
        if (isHovered) {
          const gradient = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r * 3);
          gradient.addColorStop(0, color + '40');
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Selection ring
        if (isSelected) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node circle
        ctx.beginPath();
        ctx.fillStyle = dimmed ? 'rgba(63,63,70,0.4)' : color;
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (!dimmed || isHovered || isSelected) {
          ctx.fillStyle = dimmed ? 'rgba(161,161,170,0.3)' : 'rgba(255,255,255,0.85)';
          ctx.font = '10px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.label, node.x, node.y + r + 4);
        }
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
    };
  }, [graphData, hoveredNode, selectedNode]);

  /* ---------- Mouse interactions ---------- */

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const cam = cameraRef.current;
    const x = (clientX - rect.left - rect.width / 2 - cam.x) / cam.zoom;
    const y = (clientY - rect.top - rect.height / 2 - cam.y) / cam.zoom;
    return { x, y };
  }, []);

  const findNodeAt = useCallback((worldX: number, worldY: number): SimNode | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.x == null || n.y == null) continue;
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      const r = NODE_SIZES[n.type] + 4;
      if (dx * dx + dy * dy < r * r) return n;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const node = findNodeAt(x, y);

      dragRef.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startCamX: cameraRef.current.x,
        startCamY: cameraRef.current.y,
        draggedNode: node,
      };

      if (node) {
        node.fx = node.x;
        node.fy = node.y;
        simulationRef.current?.alphaTarget(0.3).restart();
      }
    },
    [screenToWorld, findNodeAt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const drag = dragRef.current;

      if (drag.dragging) {
        if (drag.draggedNode) {
          const { x, y } = screenToWorld(e.clientX, e.clientY);
          drag.draggedNode.fx = x;
          drag.draggedNode.fy = y;
        } else {
          const dx = e.clientX - drag.startX;
          const dy = e.clientY - drag.startY;
          cameraRef.current.x = drag.startCamX + dx;
          cameraRef.current.y = drag.startCamY + dy;
        }
      } else {
        const { x, y } = screenToWorld(e.clientX, e.clientY);
        const node = findNodeAt(x, y);
        setHoveredNode(node);
      }
    },
    [screenToWorld, findNodeAt]
  );

  const handleMouseUp = useCallback(() => {
    const drag = dragRef.current;
    if (drag.draggedNode) {
      drag.draggedNode.fx = null;
      drag.draggedNode.fy = null;
      simulationRef.current?.alphaTarget(0);
    }
    drag.dragging = false;
    drag.draggedNode = null;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const node = findNodeAt(x, y);
      setSelectedNode(node);
    },
    [screenToWorld, findNodeAt]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    cameraRef.current.zoom = Math.min(5, Math.max(0.1, cameraRef.current.zoom * factor));
  }, []);

  const zoomIn = useCallback(() => {
    cameraRef.current.zoom = Math.min(5, cameraRef.current.zoom * 1.3);
  }, []);

  const zoomOut = useCallback(() => {
    cameraRef.current.zoom = Math.max(0.1, cameraRef.current.zoom / 1.3);
  }, []);

  const resetView = useCallback(() => {
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
  }, []);

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-zinc-900">
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading graph...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-zinc-900">
        <p className="text-sm text-red-400">Error: {error}</p>
        <button
          onClick={fetchGraph}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-zinc-700 bg-zinc-900">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-300">No graph data yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Generate a project graph to visualize pages, components, and their relationships.
          </p>
        </div>
        <button
          onClick={generateGraph}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Graph'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-0 overflow-hidden rounded-lg border border-gray-200">
      {/* Main graph area */}
      <div className="relative flex-1">
        <div ref={containerRef} className="h-80 sm:h-96 md:h-[600px] w-full bg-zinc-900">
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onWheel={handleWheel}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button
            onClick={zoomIn}
            className="rounded border border-zinc-700 bg-zinc-800/90 p-1.5 text-zinc-400 backdrop-blur hover:bg-zinc-700 hover:text-zinc-200"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={zoomOut}
            className="rounded border border-zinc-700 bg-zinc-800/90 p-1.5 text-zinc-400 backdrop-blur hover:bg-zinc-700 hover:text-zinc-200"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetView}
            className="rounded border border-zinc-700 bg-zinc-800/90 p-1.5 text-zinc-400 backdrop-blur hover:bg-zinc-700 hover:text-zinc-200"
            title="Reset view"
            aria-label="Reset view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Auto-Generate button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={generateGraph}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur hover:bg-zinc-700 disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Auto-Generate
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 rounded-md border border-zinc-700 bg-zinc-800/90 px-3 py-2 backdrop-blur">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {(Object.entries(NODE_COLORS) as [NodeType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-zinc-400">{NODE_TYPE_LABELS[type]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details panel */}
      {selectedNode && (
        <div className="w-64 shrink-0 border-l border-zinc-700 bg-zinc-900 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {NODE_TYPE_LABELS[selectedNode.type]}
                </span>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">{selectedNode.label}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              aria-label="Close details panel"
              className="text-zinc-500 hover:text-zinc-300"
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Connections */}
          <div className="mt-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Connections
            </div>
            <div className="mt-2 space-y-1.5">
              {linksRef.current
                .filter((l) => {
                  const s = l.source as SimNode;
                  const t = l.target as SimNode;
                  return s.id === selectedNode.id || t.id === selectedNode.id;
                })
                .map((l, i) => {
                  const s = l.source as SimNode;
                  const t = l.target as SimNode;
                  const other = s.id === selectedNode.id ? t : s;
                  const direction = s.id === selectedNode.id ? 'outgoing' : 'incoming';
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-800/50 px-2 py-1.5"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: NODE_COLORS[other.type] }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs text-zinc-300">{other.label}</div>
                        <div className="text-[10px] text-zinc-600">
                          {direction} / {l.type}
                        </div>
                      </div>
                    </div>
                  );
                })}
              {linksRef.current.filter((l) => {
                const s = l.source as SimNode;
                const t = l.target as SimNode;
                return s.id === selectedNode.id || t.id === selectedNode.id;
              }).length === 0 && <p className="text-xs text-zinc-600">No connections</p>}
            </div>
          </div>

          {/* Node ID */}
          <div className="mt-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              ID
            </div>
            <p className="mt-1 break-all font-mono text-[10px] text-zinc-500">{selectedNode.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
