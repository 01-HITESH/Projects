"use client";

import { RefObject, useEffect } from "react";
import { getGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function useScrollAnimation<T extends HTMLElement>(ref: RefObject<T>, selector = "[data-reveal]") {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) {
      return;
    }

    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
            once: true,
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [ref, reduced, selector]);
}
