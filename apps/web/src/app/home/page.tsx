import Link from "next/link";
import { Shield } from "lucide-react";
import { HeroTile } from "@/components/home/HeroTile";
import { KPITile } from "@/components/home/KPITile";
import { HowItWorksTile } from "@/components/home/HowItWorksTile";
import { MapTile } from "@/components/home/MapTile";
import { CaseStudyTile } from "@/components/home/CaseStudyTile";
import { LensesTile } from "@/components/home/LensesTile";
import { PersonasTile } from "@/components/home/PersonasTile";
import { RoadmapTile } from "@/components/home/RoadmapTile";
import { CTATile } from "@/components/home/CTATile";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F7F4EB]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Brand nav ── */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-[#E65C00]" />
            <div>
              <span className="text-lg font-semibold tracking-tight text-[#292524]">MissionGuard AI</span>
              <p className="text-[#78716C] text-xs">Ethical Gift Decision Support</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-[#E65C00] hover:text-[#CC5200] transition-colors"
          >
            Analyse a Gift →
          </Link>
        </header>

        {/* ── Bento grid ── */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Row 1 — Hero (span 2) | KPI */}
          <div className="md:col-span-2">
            <HeroTile />
          </div>
          <div>
            <KPITile />
          </div>

          {/* Row 2 — Globe hero (full width) */}
          <div className="md:col-span-3 min-h-[520px]">
            <MapTile />
          </div>

          {/* Row 3 — HowItWorks | CaseStudy | Personas */}
          <div>
            <HowItWorksTile />
          </div>
          <div>
            <CaseStudyTile />
          </div>
          <div>
            <PersonasTile />
          </div>

          {/* Row 4 — Lenses (full width) */}
          <div className="md:col-span-3">
            <LensesTile />
          </div>

          {/* Row 5 — Roadmap | CTA (span 2) */}
          <div>
            <RoadmapTile />
          </div>
          <div className="md:col-span-2">
            <CTATile />
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-[#A8A29E]">
            All data is encrypted at rest. This tool supports, not replaces, your Board's judgment.
          </p>
        </footer>
      </div>
    </div>
  );
}
