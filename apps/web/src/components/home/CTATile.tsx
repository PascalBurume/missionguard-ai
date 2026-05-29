import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTATile() {
  return (
    <div className="bento-tile-accent p-8 flex flex-col justify-between h-full min-h-[200px]">
      <div>
        <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-3">
          Get started
        </p>
        <h3 className="text-xl font-semibold text-white leading-snug">
          Ready to analyse a donor offer?
        </h3>
        <p className="text-white/70 text-sm mt-2 leading-relaxed">
          Upload a gift letter and receive a scored, ethically-grounded recommendation in under 2&nbsp;minutes.
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 bg-white text-[#E65C00] hover:bg-[#FFF5EE] text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-150 self-start"
      >
        Analyse a Gift
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
