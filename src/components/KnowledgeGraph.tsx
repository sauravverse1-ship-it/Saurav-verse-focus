import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { KnowledgeNode } from '../types';
import { BookOpen, Network, ChevronRight, Zap, Target, Book, Beaker } from 'lucide-react';
import { cn } from '../lib/utils';

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  onNodeClick?: (node: KnowledgeNode) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: KnowledgeNode['type'];
  health: number;
  subject: string;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ nodes, onNodeClick }) => {
  const [view, setView] = useState<'graph' | 'syllabus'>('graph');
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const subjects = useMemo(() => {
    const grouped: Record<string, KnowledgeNode[]> = {};
    nodes.forEach(node => {
      const sub = node.subject || 'Uncategorized';
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(node);
    });
    return grouped;
  }, [nodes]);

  useEffect(() => {
    if (view !== 'graph' || !svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const d3Nodes: D3Node[] = nodes.map(n => ({ ...n }));
    const d3Links: D3Link[] = [];

    nodes.forEach(n => {
      n.connections.forEach(targetId => {
        if (nodes.find(node => node.id === targetId)) {
          d3Links.push({ source: n.id, target: targetId });
        }
      });
    });

    const simulation = d3.forceSimulation<D3Node>(d3Nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(d3Links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    const g = svg.append("g");

    svg.call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      g.attr("transform", event.transform);
    }));

    const link = g.append("g")
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(d3Links)
      .join("line");

    const nodeGroup = g.append("g")
      .selectAll("g")
      .data(d3Nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        const originalNode = nodes.find(n => n.id === d.id);
        if (originalNode && onNodeClick) onNodeClick(originalNode);
      })
      .call(d3.drag<SVGGElement, D3Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    nodeGroup.append("circle")
      .attr("r", d => 15 + (d.health / 50))
      .attr("fill", d => {
        if (d.health > 70) return "#10b981";
        if (d.health > 30) return "#f59e0b";
        return "#ef4444";
      })
      .attr("filter", "blur(4px)")
      .attr("opacity", 0.4);

    nodeGroup.append("circle")
      .attr("r", 8)
      .attr("fill", d => {
        switch(d.type) {
          case 'note': return "#3b82f6";
          case 'task': return "#10b981";
          case 'formula': return "#ef4444";
          case 'session': return "#8b5cf6";
          default: return "#ffffff";
        }
      })
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    nodeGroup.append("text")
      .text(d => d.label)
      .attr("x", 12)
      .attr("y", 4)
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "10px")
      .attr("font-weight", "900")
      .attr("text-transform", "uppercase")
      .attr("style", "font-family: inherit;");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as D3Node).x!)
        .attr("y1", d => (d.source as D3Node).y!)
        .attr("x2", d => (d.target as D3Node).x!)
        .attr("y2", d => (d.target as D3Node).y!);

      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, view]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] glass-card bg-black/40 border-white/5 relative overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between z-20">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Knowledge Topology</h3>
          <p className="text-[10px] text-white/20 italic">Interactive Neural Mapping</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setView('graph')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              view === 'graph' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <Network className="w-3 h-3" /> Graph
          </button>
          <button 
            onClick={() => setView('syllabus')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              view === 'syllabus' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <BookOpen className="w-3 h-3" /> Syllabus
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {view === 'graph' ? (
          <svg ref={svgRef} className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            {Object.entries(subjects).map(([subject, subNodes]) => (
              <div key={subject} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-md-primary/20 flex items-center justify-center border border-md-primary/30">
                    <Book className="w-4 h-4 text-md-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tighter text-white">{subject}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{subNodes.length} Core Modules</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subNodes.map(node => (
                    <motion.button
                      key={node.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNodeClick?.(node)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-left group"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        node.type === 'note' ? "bg-blue-500/20 text-blue-400" :
                        node.type === 'task' ? "bg-green-500/20 text-green-400" :
                        node.type === 'formula' ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
                      )}>
                        {node.type === 'note' ? <BookOpen className="w-5 h-5" /> : 
                         node.type === 'task' ? <Target className="w-5 h-5" /> : 
                         node.type === 'formula' ? <Beaker className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black uppercase tracking-tight text-white/80 group-hover:text-white truncate">
                          {node.label}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-md-primary" 
                              style={{ width: `${node.health}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-white/20">{node.health}%</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
            
            {nodes.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                <Target className="w-12 h-12 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest italic tracking-[0.4em]">Zero Neural Assets Detected</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
