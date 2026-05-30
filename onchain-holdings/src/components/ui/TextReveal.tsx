"use client";

import { useEffect, useMemo, useRef } from "react";
import { getGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type TextRevealProps = {
  text: string;
  as?: "p" | "h1" | "h2" | "h3";
  type?: "words" | "chars" | "lines";
  className?: string;
};

export function TextReveal({ as: Tag = "p", className, text, type = "words" }: TextRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const parts = useMemo(() => {
    if (type === "chars") return text.split("");
    if (type === "lines") return text.split(/(?<=[.!?])\s+/);
    return text.split(" ");
  }, [text, type]);

  useEffect(() => {
    if (reduced || !ref.current) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-text-part]",
        { opacity: 0, y: 40, rotate: 5 },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.8,
          stagger: 0.05,
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <Tag ref={ref as never} className={className}>
      {parts.map((part, index) => (
        <span className="inline-block overflow-hidden align-baseline" key={`${part}-${index}`}>
          <span data-text-part className="inline-block will-change-transform">
            {part === " " ? "\u00A0" : part}
            {type === "words" ? "\u00A0" : null}
          </span>
        </span>
      ))}
    </Tag>
  );
}
