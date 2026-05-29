import { Scale, BarChart2, TrendingUp, Heart, Users } from "lucide-react";

const lenses = [
  {
    icon: Scale,
    name: "Rights & Autonomy",
    shortName: "Rights",
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-100",
    question: "Does this respect the rights and dignity of all parties?",
    redFlag: "Any clause giving the donor veto power over strategy or geography.",
  },
  {
    icon: BarChart2,
    name: "Justice & Fairness",
    shortName: "Justice",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    question: "Is the distribution of benefits and burdens fair?",
    redFlag: "Diverting resources from data-selected high-need areas to donor-preferred areas.",
  },
  {
    icon: TrendingUp,
    name: "Consequences",
    shortName: "Utilitarian",
    color: "text-[#E65C00]",
    bg: "bg-[#FFF5EE] border-[#FFDEC8]",
    question: "Which option produces the greatest good for the greatest number?",
    redFlag: "Short-term gain in new town causes measurable drop in service quality elsewhere.",
  },
  {
    icon: Users,
    name: "Common Good & Virtue",
    shortName: "Virtue",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
    question: "What would a responsible, mission-driven organisation do?",
    redFlag: "Accepting creates internal cynicism and sets a precedent future EDs can't reverse.",
  },
  {
    icon: Heart,
    name: "Care & Relationships",
    shortName: "Care",
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-100",
    question: "How does this affect trust and the web of care among stakeholders?",
    redFlag: "Secretive acceptance damages staff morale and leaves the Board blindsided.",
  },
];

export function LensesTile() {
  return (
    <div id="framework" className="bento-tile p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-1">
          Markkula Center — Five Ethical Lenses
        </p>
        <p className="text-sm text-[#78716C]">
          Every gift is evaluated through all five lenses. Each receives a score from −2 (strong conflict) to +2 (strong alignment).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {lenses.map((lens) => {
          const Icon = lens.icon;
          return (
            <div
              key={lens.name}
              className="flex flex-col gap-3 rounded-2xl border p-4 bg-white"
            >
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${lens.bg}`}>
                <Icon className={`h-4 w-4 ${lens.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#292524] leading-snug mb-1">
                  {lens.name}
                </p>
                <p className="text-[11px] text-[#78716C] leading-relaxed mb-2 italic">
                  "{lens.question}"
                </p>
                <div className="flex items-start gap-1">
                  <span className="text-[10px] font-semibold text-red-500 leading-tight mt-0.5 flex-shrink-0">⚠</span>
                  <p className="text-[10px] text-[#A8A29E] leading-relaxed">{lens.redFlag}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
