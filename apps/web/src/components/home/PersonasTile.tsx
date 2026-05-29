import { Briefcase, Award, ShieldCheck } from "lucide-react";

const personas = [
  {
    icon: Briefcase,
    name: "Lisa — Executive Director",
    need: "Fast, defensible recommendation + negotiation script before the donor meeting.",
    tag: "Primary user",
    tagColor: "bg-[#FFF5EE] text-[#E65C00] border-[#FFDEC8]",
  },
  {
    icon: Award,
    name: "Board Chair",
    need: "Clear ethical scoring + 24-month service-effectiveness forecast to fulfil fiduciary duty.",
    tag: "Governance",
    tagColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: ShieldCheck,
    name: "Ethics / Compliance Officer",
    need: "Auto-generated Precedent Policy tailored to the organisation's risk profile and sector.",
    tag: "Oversight",
    tagColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
];

export function PersonasTile() {
  return (
    <div className="bento-tile p-8 flex flex-col h-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-6">
        Who It's For
      </p>
      <div className="flex flex-col gap-5 flex-1">
        {personas.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.name} className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#F7F4EB] border border-[#E7E5E4] flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#292524]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#292524] leading-tight">{p.name}</span>
                </div>
                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border mb-1.5 ${p.tagColor}`}>
                  {p.tag}
                </span>
                <p className="text-xs text-[#78716C] leading-relaxed">{p.need}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
