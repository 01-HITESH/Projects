"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type MarqueeProps = {
  items: string[];
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
};

export function Marquee({ direction = "left", items, pauseOnHover = true, speed = 60 }: MarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const line = useMemo(() => `${items.join("  •  ")}  •  `, [items]);

  return (
    <div className="overflow-hidden border-y border-border py-4 text-light" aria-label={items.join(", ")}>
      <div
        className={pauseOnHover ? "hover:[animation-play-state:paused]" : ""}
        style={{
          "--marquee-duration": `${Math.max(18, (line.length * 18) / speed)}s`,
          animationDirection: direction === "right" ? "reverse" : "normal",
          animationPlayState: reduced ? "paused" : "running",
        } as React.CSSProperties}
      >
        <div className="animate-scroll whitespace-nowrap text-[2rem] leading-none">
          <span className="pr-8">{line}</span>
          <span className="pr-8" aria-hidden="true">
            {line}
          </span>
          <span className="pr-8" aria-hidden="true">
            {line}
          </span>
          <span className="pr-8" aria-hidden="true">
            {line}
          </span>
        </div>
      </div>
    </div>
  );
}
