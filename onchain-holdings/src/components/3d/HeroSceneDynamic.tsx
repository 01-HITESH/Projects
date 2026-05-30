"use client";

import dynamic from "next/dynamic";

export const HeroSceneDynamic = dynamic(() => import("./HeroScene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center"><div className="h-72 w-72 rounded-full border border-border bg-surface" /></div>,
});
