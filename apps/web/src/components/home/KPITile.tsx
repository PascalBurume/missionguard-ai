const stats = [
  { value: "<4", unit: "days", label: "Average decision cycle (vs 3–4 weeks today)" },
  { value: "65%", unit: "+", label: "Pilot-phase recommendation adoption target" },
  { value: "50%", unit: "↓", label: "Mission-creep incident reduction goal" },
];

export function KPITile() {
  return (
    <div className="bento-tile p-8 flex flex-col justify-between h-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-6">
        Platform Outcomes
      </p>
      <div className="flex flex-col gap-5 flex-1">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-[#E65C00] leading-none">
                {s.value}
              </span>
              <span className="text-lg font-medium text-[#E65C00]">{s.unit}</span>
            </div>
            <p className="text-xs text-[#78716C] leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#A8A29E] mt-6 leading-relaxed">
        Source: MissionGuard AI PRD §9 — 12-month targets
      </p>
    </div>
  );
}
