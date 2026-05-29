import Link from "next/link";
import { Shield, ArrowRight, BookOpen } from "lucide-react";

export function HeroTile() {
  return (
    <div className="bento-tile-dark p-8 flex flex-col justify-between min-h-[280px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#E65C00] flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-[#A8A29E]">MissionGuard AI</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#FDFBF7]">
          Turn ethical tension into{" "}
          <span className="text-[#E65C00]">defensible decisions.</span>
        </h1>
        <p className="text-[#A8A29E] text-sm leading-relaxed max-w-md">
          AI-powered gift analysis for nonprofits. Upload a donor offer and receive
          a Markkula-scored Accept / Pilot / Reject recommendation in under 2&nbsp;minutes.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#E65C00] hover:bg-[#CC5200] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-150"
        >
          Analyse a Gift
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="#framework"
          className="inline-flex items-center gap-2 border border-[#44403C] hover:border-[#78716C] text-[#A8A29E] hover:text-[#FDFBF7] text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-150"
        >
          <BookOpen className="h-4 w-4" />
          View ethical framework
        </Link>
      </div>
    </div>
  );
}
