import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { HeatmapPoint } from '../types';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  heatmapPoints?: HeatmapPoint[];
  glowColor?: string;
  onRegionSelect?: (region: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  lat, 
  lng, 
  heatmapPoints = [], 
  glowColor = '#FF3D00', 
  onRegionSelect 
}) => {
  const [zoom, setZoom] = useState(1.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [showHeatmap, setShowHeatmap] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const regions = [
    { id: 'Americas', path: "M50,50 L250,50 L250,350 L50,350 Z", x: 50, y: 50, w: 200, h: 300 },
    { id: 'EMEA', path: "M300,50 L550,50 L550,350 L300,350 Z", x: 300, y: 50, w: 250, h: 300 },
    { id: 'APAC', path: "M570,50 L780,50 L780,350 L570,350 Z", x: 570, y: 50, w: 210, h: 300 }
  ];

  const worldPath = "M150,120 L160,110 L180,105 L200,110 L220,130 L230,160 L220,190 L200,210 L170,200 L150,180 Z M300,80 L350,70 L400,80 L450,120 L480,180 L450,250 L400,280 L350,270 L300,220 Z M550,150 L600,140 L650,160 L680,210 L650,260 L600,280 L550,250 Z M100,250 L120,240 L150,260 L140,300 L110,320 L80,300 Z M700,250 L730,240 L760,260 L750,300 L720,320 L690,300 Z";

  const getCoords = useCallback((latitude: number, longitude: number) => {
    const x = (longitude + 180) * (800 / 360);
    const y = (90 - latitude) * (400 / 180);
    return { x, y };
  }, []);

  const { x: targetX, y: targetY } = getCoords(lat, lng);

  const convertedHeatmapPoints = useMemo(() => {
    return heatmapPoints.map(p => ({
      ...getCoords(p.lat, p.lng),
      weight: p.weight
    }));
  }, [heatmapPoints, getCoords]);

  const applyOffsetConstraints = useCallback((newX: number, newY: number, currentZoom: number) => {
    const minX = 800 * (1 - currentZoom);
    const minY = 400 * (1 - currentZoom);
    const maxX = 0;
    const maxY = 0;
    
    return {
      x: Math.min(Math.max(newX, minX - 200), maxX + 200),
      y: Math.min(Math.max(newY, minY - 200), maxY + 200)
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 800;
    const svgY = ((e.clientY - rect.top) / rect.height) * 400;
    
    const scaleFactor = 1.15;
    const delta = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
    const nextZoom = Math.min(Math.max(zoom * delta, 0.5), 12);
    
    const dx = (svgX - offset.x) * (1 - delta);
    const dy = (svgY - offset.y) * (1 - delta);
    
    const constrained = applyOffsetConstraints(offset.x + dx, offset.y + dy, nextZoom);
    setZoom(nextZoom);
    setOffset(constrained);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 800;
    const svgY = ((e.clientY - rect.top) / rect.height) * 400;
    
    const nextZoom = Math.min(zoom * 2, 12);
    const dx = (svgX - offset.x) * (1 - 2);
    const dy = (svgY - offset.y) * (1 - 2);
    
    setZoom(nextZoom);
    setOffset(applyOffsetConstraints(offset.x + dx, offset.y + dy, nextZoom));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    setMouseCoords({ x, y });

    if (!isPanning) return;
    
    const dx = (e.clientX - lastMousePos.x) * (800 / rect.width);
    const dy = (e.clientY - lastMousePos.y) * (400 / rect.height);
    
    setOffset(prev => applyOffsetConstraints(prev.x + dx, prev.y + dy, zoom));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastMousePos, zoom, applyOffsetConstraints]);

  useEffect(() => {
    const up = () => setIsPanning(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 40;
      if (e.key === '+') setZoom(z => Math.min(z * 1.2, 12));
      if (e.key === '-') setZoom(z => Math.max(z / 1.2, 0.5));
      if (e.key === 'ArrowUp') setOffset(o => applyOffsetConstraints(o.x, o.y + step, zoom));
      if (e.key === 'ArrowDown') setOffset(o => applyOffsetConstraints(o.x, o.y - step, zoom));
      if (e.key === 'ArrowLeft') setOffset(o => applyOffsetConstraints(o.x + step, o.y, zoom));
      if (e.key === 'ArrowRight') setOffset(o => applyOffsetConstraints(o.x - step, o.y, zoom));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', up);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, zoom, applyOffsetConstraints]);

  useEffect(() => {
    const initialZoom = 1.5;
    const initialX = (400 - targetX * initialZoom);
    const initialY = (200 - targetY * initialZoom);
    setOffset(applyOffsetConstraints(initialX, initialY, initialZoom));
    setZoom(initialZoom);
  }, [targetX, targetY, applyOffsetConstraints]);

  const handleReset = () => {
    const rZoom = 1.5;
    setZoom(rZoom);
    setOffset(applyOffsetConstraints(400 - targetX * rZoom, 200 - targetY * rZoom, rZoom));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[350px] bg-black rounded-lg overflow-hidden border border-gray-800 group select-none transition-all duration-300 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        <button onClick={() => setZoom(z => Math.min(z * 1.5, 12))} className="w-9 h-9 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-md flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl font-bold">+</button>
        <button onClick={() => setZoom(z => Math.max(z / 1.5, 0.5))} className="w-9 h-9 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-md flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl font-bold">-</button>
        <button onClick={handleReset} className="w-9 h-9 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-md flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl" title="Reset View">⟲</button>
        <button onClick={() => setShowHeatmap(!showHeatmap)} className={`w-9 h-9 rounded-md border border-gray-700 flex items-center justify-center transition-all shadow-xl ${showHeatmap ? 'bg-indigo-600 text-white' : 'bg-gray-900/90 text-indigo-400'}`} title="Toggle Risk Heatmap">
          {showHeatmap ? '🔥' : '📍'}
        </button>
      </div>

      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md p-2 rounded border border-indigo-500/20 font-mono text-[9px] text-indigo-400 uppercase tracking-widest flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            SYNCED_SATELLITE_LINK
          </div>
          <div className="h-[2px] w-full bg-gray-800 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(zoom / 12) * 100}%` }}></div>
          </div>
          <span>MAG: {zoom.toFixed(2)}x</span>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-20 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-gray-800 font-mono text-[10px] text-indigo-400/80 shadow-2xl flex flex-col gap-0.5">
          <div className="flex gap-2"><span className="text-gray-600">SECTOR:</span><span>{hoveredRegion || 'GLOBAL_SCAN'}</span></div>
          <div className="flex gap-2"><span className="text-gray-600">COORD:</span><span>{offset.x.toFixed(0)}, {offset.y.toFixed(0)}</span></div>
        </div>
        
        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-gray-800 font-mono text-[10px] text-emerald-400/80 shadow-2xl flex flex-col items-center">
          <div className="text-[8px] text-gray-500 mb-1 tracking-tighter uppercase">Position Matrix</div>
          <div className="grid grid-cols-3 gap-0.5 text-[8px] opacity-50">
            <div></div><div className={offset.y > -50 ? 'text-indigo-400' : ''}>▲</div><div></div>
            <div className={offset.x > -50 ? 'text-indigo-400' : ''}>◀</div><div></div><div className={offset.x < -350 ? 'text-indigo-400' : ''}>▶</div>
            <div></div><div className={offset.y < -150 ? 'text-indigo-400' : ''}>▼</div><div></div>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-gray-800 font-mono text-[10px] text-emerald-400/80 shadow-2xl">
          LAT: {((400 - mouseCoords.y) / 2.22).toFixed(2)} | LNG: {((mouseCoords.x - 400) / 2.22).toFixed(2)}
        </div>
      </div>

      <svg viewBox="0 0 800 400" className="w-full h-full">
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="heatmapFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="contrast" />
            <feComponentTransfer in="contrast">
              <feFuncR type="table" tableValues="0 0.1 0.8 1" />
              <feFuncG type="table" tableValues="0 0.4 0.2 0.2" />
              <feFuncB type="table" tableValues="0 0.8 0.1 0" />
              <feFuncA type="table" tableValues="0 0.5 0.8 1" />
            </feComponentTransfer>
          </filter>
          <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(79, 70, 229, 0.12)" strokeWidth="0.5"/>
          </pattern>
        </defs>

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`} className="transition-transform duration-75 ease-out">
          <rect x="-2000" y="-1000" width="4000" height="2000" fill="#050505" />
          <rect x="-2000" y="-1000" width="4000" height="2000" fill="url(#tacticalGrid)" />
          
          {showHeatmap && (
            <g filter="url(#heatmapFilter)" opacity="0.6">
              {convertedHeatmapPoints.map((p, i) => (
                <circle 
                  key={i} 
                  cx={p.x} 
                  cy={p.y} 
                  r={25 + (p.weight * 30)} 
                  fill={`rgba(255, 0, 0, ${0.4 + p.weight * 0.6})`} 
                />
              ))}
              <circle cx={targetX} cy={targetY} r="45" fill="red" />
            </g>
          )}

          {regions.map(reg => {
            const isHovered = hoveredRegion === reg.id;
            return (
              <React.Fragment key={reg.id}>
                <path 
                  d={reg.path}
                  fill={isHovered ? "rgba(99, 102, 241, 0.18)" : "transparent"}
                  stroke={isHovered ? "rgba(129, 140, 248, 0.9)" : "rgba(255, 255, 255, 0.01)"}
                  strokeWidth={isHovered ? 2 / zoom : 1 / zoom}
                  filter={isHovered ? "url(#neonGlow)" : ""}
                  onMouseEnter={() => setHoveredRegion(reg.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={(e) => { e.stopPropagation(); onRegionSelect?.(reg.id); }}
                  className="cursor-pointer transition-all duration-300 ease-out"
                />
                {isHovered && (
                  <g pointerEvents="none" className="animate-in fade-in zoom-in-95 duration-300">
                    <path d={`M${reg.x},${reg.y + 15} L${reg.x},${reg.y} L${reg.x + 15},${reg.y}`} fill="none" stroke="#818cf8" strokeWidth={2/zoom} />
                    <path d={`M${reg.x + reg.w - 15},${reg.y} L${reg.x + reg.w},${reg.y} L${reg.x + reg.w},${reg.y + 15}`} fill="none" stroke="#818cf8" strokeWidth={2/zoom} />
                    <path d={`M${reg.x},${reg.y + reg.h - 15} L${reg.x},${reg.y + reg.h} L${reg.x + 15},${reg.y + reg.h}`} fill="none" stroke="#818cf8" strokeWidth={2/zoom} />
                    <path d={`M${reg.x + reg.w - 15},${reg.y + reg.h} L${reg.x + reg.w},${reg.y + reg.h} L${reg.x + reg.w},${reg.y + reg.h - 15}`} fill="none" stroke="#818cf8" strokeWidth={2/zoom} />
                  </g>
                )}
              </React.Fragment>
            );
          })}

          <path d={worldPath} fill="rgba(255, 255, 255, 0.03)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth={1 / zoom} pointerEvents="none" />

          <g transform={`translate(${targetX}, ${targetY})`} pointerEvents="none">
            <circle r="40" fill={glowColor} fillOpacity="0.1" className="animate-[ping_3s_infinite_ease-out]" />
            <circle r={5 / zoom} fill={glowColor} />
            <circle r={18 / zoom} fill="none" stroke={glowColor} strokeWidth={0.5 / zoom} strokeDasharray={`${3 / zoom} ${3 / zoom}`} className="animate-[spin_12s_linear_infinite]" />
            <line x1={-10/zoom} y1="0" x2={10/zoom} y2="0" stroke={glowColor} strokeWidth={0.5/zoom} />
            <line x1="0" y1={-10/zoom} x2="0" y2={10/zoom} stroke={glowColor} strokeWidth={0.5/zoom} />
          </g>
        </g>

        <g pointerEvents="none" opacity="0.4">
          <line x1={mouseCoords.x} y1="0" x2={mouseCoords.x} y2="400" stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="0" y1={mouseCoords.y} x2="800" y2={mouseCoords.y} stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx={mouseCoords.x} cy={mouseCoords.y} r="10" fill="none" stroke="#4f46e5" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
};

export default InteractiveMap;
