"use client";

import { useState } from "react";
import { Globe2, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import dynamic from "next/dynamic";
import AmbientParticles from "./AmbientParticles";

const Globe = dynamic(() => import("./Globe"), { ssr: false, loading: () => null });

const LEGEND: { label: string; color: string; role: string; bold?: boolean; border?: boolean }[] = [
  { label: "New York",  color: "#E65C00", role: "East Coast donor" },
  { label: "Miami",     color: "#FF8C42", role: "SE donor" },
  { label: "Chicago",   color: "#E65C00", role: "Midwest donor" },
  { label: "Dallas",    color: "#E65C00", role: "South donor" },
  { label: "Fresno",    color: "#CC4A00", role: "Recipient hub", bold: true },
  { label: "Seattle",   color: "#FFB380", role: "Pacific NW donor", border: true },
] ;

export function MapTile() {
  const [cameraZ, setCameraZ] = useState(3.6);
  const zoomIn  = () => setCameraZ(z => Math.max(2.2, +(z - 0.4).toFixed(1)));
  const zoomOut = () => setCameraZ(z => Math.min(6.0, +(z + 0.4).toFixed(1)));
  return (
    <div
      className="bento-tile overflow-hidden flex flex-col h-full"
      style={{ background: "linear-gradient(160deg, #FDFBF7 0%, #EDE5D8 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-6 pb-2 relative z-20">
        <div className="w-8 h-8 rounded-xl bg-[#FFF5EE] border border-[#FFDEC8] flex items-center justify-center">
          <Globe2 className="h-4 w-4 text-[#E65C00]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C]">Gift-Flow Network</p>
          <p className="text-[10px] text-[#A8A29E]">National → Central Valley • Live simulation</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            disabled={cameraZ >= 6.0}
            className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#FFF5EE] border border-[#FFDEC8] text-[#E65C00] hover:bg-[#FFDEC8] disabled:opacity-30 transition-colors"
            title="Zoom out"
          ><ZoomOut className="w-3 h-3" /></button>
          <button
            onClick={zoomIn}
            disabled={cameraZ <= 2.2}
            className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#FFF5EE] border border-[#FFDEC8] text-[#E65C00] hover:bg-[#FFDEC8] disabled:opacity-30 transition-colors"
            title="Zoom in"
          ><ZoomIn className="w-3 h-3" /></button>
          {/* Live badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#E65C00] bg-[#FFF5EE] border border-[#FFDEC8] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E65C00] animate-pulse" />
            6 active flows
          </div>
        </div>
      </div>

      {/* Globe canvas — hero */}
      <div className="flex-1 min-h-[420px] relative">
        <Globe cameraZ={cameraZ} />
        <AmbientParticles />
      </div>

      {/* Legend grid — 2 rows × 3 cols */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 px-6 py-4 relative z-20 border-t border-[#E7E5E4]">
        {LEGEND.map(({ label, color, role, bold, border }) => (
          <div key={label} className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: color,
                boxShadow: border ? `0 0 0 1.5px ${color}50` : undefined,
                opacity: border ? 0.85 : 1,
              }}
            />
            <div className="min-w-0">
              <p className={`text-[10px] truncate leading-tight ${bold ? "font-semibold text-[#292524]" : "text-[#78716C]"}`}>
                {label}
              </p>
              <p className="text-[9px] text-[#A8A29E] leading-tight">{role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Arc flow key */}
      <div className="flex items-center gap-2 px-6 pb-5 relative z-20">
        <span className="w-8 h-px bg-[#E65C00] opacity-50" />
        <ArrowRight className="w-2.5 h-2.5 text-[#E65C00] opacity-50 -ml-1" />
        <span className="text-[9px] text-[#A8A29E] uppercase tracking-wider">Gift-flow arc</span>
        <span className="w-2 h-2 rounded-full bg-[#FFD4A8] ml-2" />
        <span className="text-[9px] text-[#A8A29E] uppercase tracking-wider">Signal packet</span>
      </div>
    </div>
  );
}
