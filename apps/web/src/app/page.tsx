"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Upload,
  FileText,
  Building2,
  DollarSign,
  Lock,
  ShieldCheck,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

const ORG_ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000001";

export default function GiftIntakePage() {
  const router = useRouter();
  const [donorName, setDonorName] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [offerText, setOfferText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { gift_id } = await api.intakeGift({
        organization_id: ORG_ID_PLACEHOLDER,
        donor_name: donorName || undefined,
        amount_usd: amountUsd ? parseFloat(amountUsd) : undefined,
        raw_offer_text: offerText || undefined,
      });
      if (file) await api.uploadGiftDocument(gift_id, file);
      router.push(`/analyze/${gift_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">

        {/* Top nav */}
        <div className="flex items-center justify-between fade-up">
          <div className="flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-[#E65C00]" />
            <span className="text-[#292524] font-semibold text-base tracking-tight">MissionGuard AI</span>
          </div>
          <Link href="/home" className="text-sm text-[#78716C] hover:text-[#E65C00] transition-colors flex items-center gap-1">
            Product overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Eyebrow + headline */}
        <div className="text-center space-y-3 fade-up-delay-1">
          <span className="chip chip-brand">Ethical Decision Support</span>
          <h1 className="text-4xl font-medium tracking-tight text-[#292524] leading-tight">
            Decide with confidence
          </h1>
          <p className="text-[#78716C] text-base">
            Submit a donor offer and receive a structured ethical analysis in under 2 minutes.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs">
            <span className="chip chip-brand font-semibold">1 · Intake</span>
            <span className="text-[#C0B8B0]">→</span>
            <span className="chip chip-mute">2 · Analysis</span>
            <span className="text-[#C0B8B0]">→</span>
            <span className="chip chip-mute">3 · Decision</span>
          </div>
        </div>

        {/* Glass shell form */}
        <div className="glass-shell fade-up-delay-2">
          <Card className="rounded-[14px] border-0 shadow-none bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="donor" className="text-[#292524] text-sm font-medium">Donor Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C0B8B0]" />
                      <Input
                        id="donor"
                        placeholder="Smith Family Foundation"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="pl-9 bg-white border-[#E7E5E4] text-[#292524] placeholder:text-[#C0B8B0] focus-visible:ring-[#E65C00] focus-visible:ring-1 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-[#292524] text-sm font-medium">
                      Gift Amount <span className="text-[#C0B8B0] font-normal">(USD)</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C0B8B0]" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="500,000"
                        value={amountUsd}
                        onChange={(e) => setAmountUsd(e.target.value)}
                        className="pl-9 bg-white border-[#E7E5E4] text-[#292524] placeholder:text-[#C0B8B0] focus-visible:ring-[#E65C00] focus-visible:ring-1 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="offer" className="text-[#292524] text-sm font-medium">Offer Text</Label>
                  <Textarea
                    id="offer"
                    rows={7}
                    placeholder="Paste the donor offer letter, grant agreement, or key terms here…"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    className="bg-white border-[#E7E5E4] text-[#292524] placeholder:text-[#C0B8B0] focus-visible:ring-[#E65C00] focus-visible:ring-1 rounded-xl resize-none overflow-x-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#292524] text-sm font-medium">Or Upload PDF / Text</Label>
                  <label
                    htmlFor="file"
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={[
                      "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 cursor-pointer transition-colors",
                      dragOver
                        ? "border-[#E65C00] bg-[#FFF5E6]"
                        : "border-[#E7E5E4] bg-[#FDFBF7] hover:border-[#E65C00] hover:bg-[#FFF5E6]",
                    ].join(" ")}
                  >
                    <Upload className={`h-5 w-5 ${dragOver ? "text-[#E65C00]" : "text-[#C0B8B0]"}`} />
                    {file ? (
                      <span className="text-sm text-[#292524] flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#E65C00]" />
                        {file.name}
                      </span>
                    ) : (
                      <span className="text-sm text-[#78716C]">
                        Drag &amp; drop or <span className="text-[#E65C00] font-medium">browse</span>
                      </span>
                    )}
                    <span className="text-xs text-[#C0B8B0]">.pdf · .txt · max 10 MB</span>
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || (!offerText && !file)}
                  className="w-full rounded-full bg-[#E65C00] hover:bg-[#CC5200] active:bg-[#B84D00] text-white font-medium h-11 text-base transition-colors disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 animate-pulse" /> Analysing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Analyse Donor Offer <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-8 fade-up-delay-3">
          {([
            { Icon: Lock, label: "Encrypted at rest" },
            { Icon: ShieldCheck, label: "SOC 2 compliant" },
            { Icon: FileCheck, label: "Full audit trail" },
          ] as const).map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-[#78716C]">
              <Icon className="h-3.5 w-3.5 text-[#C0B8B0]" />
              {label}
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-[#C0B8B0] fade-up-delay-4">
          MissionGuard AI supports—never replaces—your Board&apos;s judgment.
        </p>
      </div>
    </div>
  );
}
