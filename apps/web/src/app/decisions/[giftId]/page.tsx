"use client";

import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DecisionConfirmedPage() {
  const { giftId } = useParams<{ giftId: string }>();
  const params = useSearchParams();
  const choice = params.get("choice") ?? "pilot";

  const messages: Record<string, { title: string; body: string }> = {
    pilot: {
      title: "Pilot Phase Accepted",
      body: "The donor offer has been structured as a time-limited pilot. The one-click Board memo and Precedent Policy draft are ready to generate.",
    },
    accept: {
      title: "Gift Accepted",
      body: "Full acceptance recorded in the audit trail. Ensure your Board has been notified via the Disclosure Engine.",
    },
    reject: {
      title: "Gift Declined",
      body: "The decision to decline has been logged. Consider using the negotiation script generator to craft a respectful response to the donor.",
    },
  };

  const { title, body } = messages[choice] ?? messages.pilot;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F7F4EB] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#E65C00]" />
          <h1 className="text-xl font-semibold text-[#292524]">Decision Logged</h1>
        </div>
        <div className="glass-shell">
          <Card className="rounded-[14px] border-0 shadow-none bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E65C00]">
                <CheckCircle className="h-5 w-5" /> {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#292524] text-sm">{body}</p>
              <p className="text-[#78716C] text-xs font-mono">Gift ID: {giftId}</p>
              <div className="flex gap-3">
                <Button asChild className="rounded-full bg-[#E65C00] hover:bg-[#CC5200] text-white">
                  <Link href="/">New Analysis</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#E7E5E4] text-[#292524] hover:bg-[#F7F4EB]">
                  <Link href={`/analyze/${giftId}`}>Review Report</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
