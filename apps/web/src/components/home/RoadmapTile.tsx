const phases = [
  {
    phase: "Phase 1",
    label: "MVP",
    months: "Months 1–4",
    items: ["Gift intake + AI scoring", "Basic Pilot Phase designer", "One-click disclosure report"],
    status: "current",
  },
  {
    phase: "Phase 2",
    label: "Beta",
    months: "Months 5–8",
    items: ["Full simulation dashboard", "Precedent Policy generator", "Salesforce + email integrations"],
    status: "upcoming",
  },
  {
    phase: "Phase 3",
    label: "Launch",
    months: "Months 9–12",
    items: ["Anonymised precedent database", "Advanced compliance module", "Free / Pro / Enterprise tiers"],
    status: "upcoming",
  },
];

export function RoadmapTile() {
  return (
    <div className="bento-tile p-8 flex flex-col h-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-6">
        Roadmap
      </p>
      <div className="flex flex-col gap-0 flex-1 relative">
        {/* vertical line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#E7E5E4]" />

        {phases.map((p, i) => (
          <div key={p.phase} className="flex gap-4 pb-6 last:pb-0 relative">
            {/* dot */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                p.status === "current"
                  ? "bg-[#E65C00] border-[#E65C00]"
                  : "bg-white border-[#E7E5E4]"
              }`}
            >
              <span
                className={`text-[10px] font-bold ${
                  p.status === "current" ? "text-white" : "text-[#78716C]"
                }`}
              >
                {i + 1}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-[#292524]">{p.label}</span>
                <span className="text-[10px] text-[#78716C]">{p.months}</span>
              </div>
              <ul className="space-y-0.5">
                {p.items.map((item) => (
                  <li key={item} className="text-xs text-[#78716C] leading-relaxed">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
