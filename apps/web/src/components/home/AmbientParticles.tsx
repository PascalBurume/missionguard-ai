"use client";

import { useEffect, useRef } from "react";

interface Particle {
  el: HTMLSpanElement;
  y: number;
  speed: number;
}

export default function AmbientParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: Particle[] = [];
    const NUM = 30;

    for (let i = 0; i < NUM; i++) {
      const el = document.createElement("span");
      const size = Math.random() > 0.5 ? "2px" : "1px";
      el.style.cssText = `
        position: absolute;
        border-radius: 9999px;
        background: #E65C00;
        width: ${size};
        height: ${size};
        left: ${Math.random() * 100}%;
        opacity: ${(Math.random() * 0.25 + 0.05).toFixed(2)};
        pointer-events: none;
      `;
      const y = Math.random() * 100;
      el.style.top = `${y}%`;
      container.appendChild(el);
      particles.push({ el, y, speed: Math.random() * 0.08 + 0.02 });
    }

    let raf: number;
    function animate() {
      raf = requestAnimationFrame(animate);
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < -5) {
          p.y = 105;
          p.el.style.left = `${Math.random() * 100}%`;
        }
        p.el.style.top = `${p.y}%`;
      }
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      for (const p of particles) p.el.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
