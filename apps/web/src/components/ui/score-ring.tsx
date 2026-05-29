import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number; // 0 – 100
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}

function ringColor(v: number): string {
  if (v >= 75) return "#E65C00"; // brand
  if (v >= 50) return "#F59E0B"; // amber
  return "#DC2626";              // red
}

export function ScoreRing({ value, label, size = "sm", className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = ringColor(clamped);

  const dim = size === "lg" ? 160 : 100;
  const strokeW = size === "lg" ? 10 : 7;
  const radius = (dim - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Score"}
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="#F2EBDD"
          strokeWidth={strokeW}
        />
        {/* Filled arc */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.4,0,.2,1), stroke 300ms" }}
        />
      </svg>

      {/* Centre text (rotated back) */}
      <div
        className="flex flex-col items-center"
        style={{ marginTop: `-${dim * 0.72}px` }}
      >
        <span
          className="font-semibold leading-none text-[#292524]"
          style={{ fontSize: size === "lg" ? "2.25rem" : "1.375rem" }}
        >
          {clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}
        </span>
        <span
          className="text-[#78716C] leading-tight mt-0.5"
          style={{ fontSize: size === "lg" ? "0.75rem" : "0.625rem" }}
        >
          / 100
        </span>
      </div>

      {/* Spacer for the inline SVG height */}
      <div style={{ height: `${dim * 0.28}px` }} />

      {label && (
        <span
          className="text-[#78716C] font-medium text-center"
          style={{ fontSize: size === "lg" ? "0.875rem" : "0.75rem" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
