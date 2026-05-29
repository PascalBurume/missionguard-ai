import { FileText, Shield, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Intake",
    description: "Paste or upload the donor offer letter. AI extracts restrictions, veto clauses, timeline, and naming rights automatically.",
  },
  {
    icon: Shield,
    number: "02",
    title: "Score",
    description: "The Markkula Engine evaluates the offer through five ethical lenses — Rights, Justice, Consequences, Common Good, and Care — producing a weighted score.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Decide",
    description: "Receive a clear Accept / Pilot Phase / Reject recommendation with confidence score, ethical rationale, and a ready-to-use negotiation script.",
  },
];

export function HowItWorksTile() {
  return (
    <div className="bento-tile p-8 flex flex-col h-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-6">
        How It Works
      </p>
      <div className="flex flex-col gap-5 flex-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#FFF5EE] border border-[#FFDEC8] flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#E65C00]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#E65C00] tracking-widest">{step.number}</span>
                  <span className="text-sm font-semibold text-[#292524]">{step.title}</span>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
