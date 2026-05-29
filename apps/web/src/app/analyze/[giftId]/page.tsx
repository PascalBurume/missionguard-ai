"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/score-ring";
import type { GiftAnalysisResponse } from "@missionguard/shared";
import { api } from "@/lib/api";

const LENS_LABELS: Record<string, string> = {
  rights:       "Rights",
  justice:      "Justice",
  consequences: "Consequences",
  common_good:  "Common Good",
  care:         "Care",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function RecommendationBadge({ rec }: { rec: string }) {
  if (rec === "pilot")
    return (
      <span className="chip chip-amber text-sm px-4 py-1.5">
        ✦ Pilot Phase (Modified Acceptance)
      </span>
    );
  if (rec === "accept")
    return (
      <span className="chip chip-green text-sm px-4 py-1.5">
        ✓ Accept
      </span>
    );
  return (
    <span className="chip chip-red text-sm px-4 py-1.5">
      ✗ Reject
    </span>
  );
}

function LensChip({ score, label }: { score: number; label: string }) {
  const cls =
    score >= 1 ? "chip-green" : score <= -1 ? "chip-red" : "chip-amber";
  const sign = score > 0 ? "+" : "";
  return (
    <span className={`chip ${cls}`}>
      {sign}{score} {label}
    </span>
  );
}

function SkeletonBento({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? "h-40"}`} />;
}

// ── Loading state ──────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div className="min-h-screen bg-canvas p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="glass-shell">
          <div className="rounded-[14px] bg-white p-6 flex gap-6 items-center">
            <div className="skeleton rounded-full" style={{ width: 160, height: 160, flexShrink: 0 }} />
            <div className="flex-1 space-y-3">
              <SkeletonBento className="h-6 w-48" />
              <SkeletonBento className="h-4 w-full" />
              <SkeletonBento className="h-4 w-3/4" />
              <SkeletonBento className="h-4 w-5/6" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonBento className="h-48 col-span-2" />
          <SkeletonBento className="h-48" />
          <SkeletonBento className="h-36" />
          <SkeletonBento className="h-36 col-span-2" />
        </div>
        <div className="text-center mt-4 space-y-2">
          <Shield className="h-8 w-8 text-[#E65C00] mx-auto animate-pulse" />
          <p className="text-sm text-[#78716C]">Applying 5-step Markkula Framework + PMI scoring…</p>
        </div>
      </div>
    </div>
  );
}

// ── Error state ────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="glass-shell w-full max-w-md">
        <div className="rounded-[14px] bg-white p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="text-[#292524] font-semibold text-lg">Analysis failed</h2>
          <p className="text-[#78716C] text-sm">{message}</p>
          <Button
            onClick={onRetry}
            className="rounded-full bg-[#E65C00] hover:bg-[#CC5200] text-white"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { giftId } = useParams<{ giftId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<GiftAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [deciding, setDeciding] = useState(false);

  function runAnalysis() {
    setLoading(true);
    setError(null);
    api
      .analyzeGift(giftId)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { runAnalysis(); }, [giftId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDecision(choice: "accept" | "pilot" | "reject") {
    if (!report) return;
    setDeciding(true);
    try {
      await api.recordDecision(giftId, {
        final_choice: choice,
        decided_by_user_id: "current-user",
      });
      router.push(`/decisions/${giftId}?choice=${choice}`);
    } finally {
      setDeciding(false);
    }
  }

  if (loading) return <LoadingView />;
  if (error || !report) return <ErrorView message={error ?? "No report returned."} onRetry={runAnalysis} />;

  const lensData = report.reasoning_trace.step3.map((ls) => ({
    lens: LENS_LABELS[ls.lens] ?? ls.lens,
    score: ((ls.score + 2) / 4) * 100,
  }));

  return (
    <div className="min-h-screen bg-canvas pb-32">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* ── Top nav bar ── */}
        <div className="flex items-center justify-between fade-up">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-sm text-[#78716C] hover:text-[#E65C00] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> New intake
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#E65C00]" />
            <span className="text-[#292524] font-semibold text-sm">MissionGuard AI</span>
          </div>
          {report.line_crossing_triggered && (
            <Badge className="bg-red-100 text-red-700 border border-red-200 gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" /> Line-Crossing Rule
            </Badge>
          )}
        </div>

        {/* ── Hero band ── */}
        <div className="glass-shell fade-up-delay-1">
          <div className="rounded-[14px] bg-white p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Left: Ring + badge */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <ScoreRing value={report.ethical_score} label="Ethical Score" size="lg" />
                <RecommendationBadge rec={report.recommendation} />
              </div>

              {/* Right: Justification */}
              <div className="flex-1 space-y-4">
                {/* Plain-English label */}
                <div>
                  <p className="text-xs font-semibold text-[#E65C00] uppercase tracking-wide mb-1">
                    What this means for your organisation
                  </p>
                  <p className="text-[#78716C] text-xs">
                    Our AI reviewed the offer through 5 ethical lenses and summarised its findings below.
                  </p>
                </div>

                {/* Justification text in a soft box */}
                <div className="bg-[#FDFBF7] border border-[#F2EBDD] rounded-xl p-4">
                  <p className="text-[#292524] text-sm leading-relaxed">
                    {report.reasoning_trace.step4.justification}
                  </p>
                </div>

                {/* Confidence + score chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="chip chip-brand">
                    {report.confidence_pct.toFixed(0)}% confident
                  </span>
                  <span className="chip chip-mute">
                    Ethics: {report.markkula_score.toFixed(1)}
                  </span>
                  <span className="chip chip-mute">
                    Values: {report.pmi_score.toFixed(1)}
                  </span>
                </div>

                <p className="text-[#C0B8B0] text-xs">{report.disclaimer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-up-delay-2">

          {/* Score Composition — col-span-2 */}
          <div className="bento-tile p-5 md:col-span-2">
            <h3 className="text-[#292524] font-medium text-sm mb-4">Score Composition</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#78716C]">
                  <span>Fused Ethical Score <span className="text-[#C0B8B0]">(60% Markkula + 40% PMI)</span></span>
                  <span className="font-mono font-semibold text-[#292524]">{report.ethical_score.toFixed(1)}</span>
                </div>
                <Progress
                  value={report.ethical_score}
                  indicatorClassName="bg-[#E65C00]"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#78716C]">
                  <span>Markkula Framework <span className="text-[#C0B8B0]">(5-lens)</span></span>
                  <span className="font-mono font-semibold text-[#292524]">{report.markkula_score.toFixed(1)}</span>
                </div>
                <Progress
                  value={report.markkula_score}
                  indicatorClassName="bg-amber-500"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#78716C]">
                  <span>PMI Code of Ethics</span>
                  <span className="font-mono font-semibold text-[#292524]">{report.pmi_score.toFixed(1)}</span>
                </div>
                <Progress
                  value={report.pmi_score}
                  indicatorClassName="bg-[#FFB380]"
                />
              </div>
            </div>
          </div>

          {/* 5-Lens Radar — col-span-1 */}
          <div className="bento-tile p-5">
            <h3 className="text-[#292524] font-medium text-sm mb-2">5-Lens Radar</h3>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={lensData}>
                <PolarGrid stroke="#E7E5E4" />
                <PolarAngleAxis dataKey="lens" tick={{ fill: "#78716C", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E7E5E4",
                    color: "#292524",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(0)}/100`]}
                />
                <Radar dataKey="score" stroke="#E65C00" fill="#E65C00" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Extracted Terms — col-span-1 */}
          <div className="bento-tile p-5">
            <h3 className="text-[#292524] font-medium text-sm mb-3">Extracted Terms</h3>
            <div className="space-y-3">
              {Object.entries(report.extracted_terms).map(([k, v]) => {
                const display = Array.isArray(v)
                  ? v.join(", ") || "None"
                  : String(v ?? "—");
                const isShort = display.length <= 30;
                return (
                  <div key={k} className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wide">
                      {k.replace(/_/g, " ")}
                    </p>
                    {isShort ? (
                      <span className="chip chip-mute">{display}</span>
                    ) : (
                      <p className="text-xs text-[#292524] leading-relaxed">{display}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stakeholders — col-span-2 */}
          <div className="bento-tile p-5 md:col-span-2">
            <h3 className="text-[#292524] font-medium text-sm mb-3">Stakeholders Identified</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.reasoning_trace.step2.map((s, i) => {
                const initials = s
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0] ?? "")
                  .join("")
                  .toUpperCase();
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="h-7 w-7 rounded-full bg-[#FFF5E6] border border-[#FCEBD5] flex items-center justify-center text-[10px] font-semibold text-[#E65C00] shrink-0"
                    >
                      {initials || "?"}
                    </div>
                    <span className="text-[#292524] text-xs">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Reasoning trace accordion ── */}
        <div className="bento-tile overflow-hidden fade-up-delay-3">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FDFBF7] transition-colors"
            onClick={() => setShowTrace(!showTrace)}
            aria-expanded={showTrace}
          >
            <span className="text-[#292524] font-medium text-sm">Full 5-Step Reasoning Trace</span>
            {showTrace ? (
              <ChevronUp className="h-4 w-4 text-[#78716C] shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#78716C] shrink-0" />
            )}
          </button>

          {showTrace && (
            <div className="px-5 pb-5 space-y-5 text-sm border-t border-[#F2EBDD]">
              <div className="pt-4">
                <p className="text-[#E65C00] font-medium mb-1.5">Step 1 · Ethical Issue Recognition</p>
                <p className="text-[#292524] leading-relaxed">{report.reasoning_trace.step1}</p>
              </div>

              <div>
                <p className="text-[#E65C00] font-medium mb-2">Step 3 · Lens Scores</p>
                <div className="space-y-2">
                  {report.reasoning_trace.step3.map((ls) => (
                    <div key={ls.lens} className="border border-[#F2EBDD] rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <LensChip score={ls.score} label={LENS_LABELS[ls.lens] ?? ls.lens} />
                      </div>
                      <p className="text-[#78716C] text-xs leading-relaxed">{ls.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#E65C00] font-medium mb-1.5">Step 4 · Sensitivity Check</p>
                <p className="text-[#292524] leading-relaxed">{report.reasoning_trace.step4.sensitivity}</p>
              </div>

              <div>
                <p className="text-[#E65C00] font-medium mb-2">Step 5 · Recommended Next Steps</p>
                <ul className="space-y-1.5">
                  {report.reasoning_trace.step5.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[#292524]">
                      <span className="text-[#E65C00] font-medium shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Sticky decision bar ── */}
      <div className="decision-bar">
        <div className="glass-shell">
          <div className="rounded-[14px] bg-white px-5 py-3.5 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-[#292524] font-medium text-sm">Record Your Decision</p>
              <p className="text-[#78716C] text-xs">AI recommendation is advisory — log your Board's final choice.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                onClick={() => handleDecision("pilot")}
                disabled={deciding}
                className="rounded-full bg-amber-500 hover:bg-amber-400 text-white font-medium px-5"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" /> Pilot
              </Button>
              <Button
                onClick={() => handleDecision("accept")}
                disabled={deciding}
                className="rounded-full bg-[#E65C00] hover:bg-[#CC5200] text-white font-medium px-5"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" /> Accept
              </Button>
              <Button
                onClick={() => handleDecision("reject")}
                disabled={deciding}
                className="rounded-full bg-red-600 hover:bg-red-500 text-white font-medium px-5"
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Reject
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
