"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function getGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power2.out" });
    registered = true;
  }

  return { gsap, ScrollTrigger };
}
