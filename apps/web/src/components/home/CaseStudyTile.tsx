import { Home, ExternalLink } from "lucide-react";

export function CaseStudyTile() {
  return (
    <div className="bento-tile p-8 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#FFF5EE] border border-[#FFDEC8] flex items-center justify-center">
          <Home className="h-3.5 w-3.5 text-[#E65C00]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C]">
          Case Study
        </p>
      </div>

      <h3 className="text-base font-semibold text-[#292524] mb-3 leading-snug">
        Affordable Housing for All
      </h3>

      <blockquote className="border-l-2 border-[#E65C00] pl-4 mb-4">
        <p className="text-xs text-[#78716C] leading-relaxed italic">
          "A major donor offers funding large enough to cover both the planned
          Western-town expansion <em>and</em> an unplanned neighbouring town —
          but only if the unplanned town is added immediately."
        </p>
      </blockquote>

      <p className="text-xs text-[#78716C] leading-relaxed flex-1">
        Executive Director Lisa faces a classic mission-creep dilemma: accept
        transformative funding that bypasses a data-driven strategic plan, or
        protect organisational integrity at the cost of the donor relationship.
        MissionGuard AI operationalises the{" "}
        <span className="font-medium text-[#292524]">Modified Acceptance (Pilot Phase)</span>{" "}
        path identified by the Markkula Center ethics analysis.
      </p>

      <a
        href="https://www.scu.edu/ethics/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-[#E65C00] hover:text-[#CC5200] transition-colors"
      >
        Markkula Center for Applied Ethics
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
