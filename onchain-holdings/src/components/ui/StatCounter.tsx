"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type StatCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
};

export function StatCounter({ prefix = "", suffix = "", value }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) {
      setDisplay(value);
      return;
    }

    const { gsap } = getGsap();
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: value,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => setDisplay(Math.round(counter.val)),
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
    });

    return () => {
      tween.kill();
    };
  }, [reduced, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
