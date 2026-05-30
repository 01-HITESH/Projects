"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Brand } from "@/types";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative min-h-[24rem] overflow-hidden rounded-2xl border border-border bg-surface p-6"
    >
      <Image
        src={brand.coverImage}
        alt={`${brand.name} brand world`}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover opacity-0 transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] [clip-path:inset(100%_0_0_0)] group-hover:opacity-75 group-hover:[clip-path:inset(0%_0_0_0)]"
      />
      <div className="absolute inset-0 bg-bg/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-secondary">{brand.id}</p>
          <h3 className="display text-[length:var(--text-h2)] leading-none text-accent">{brand.name}</h3>
          <p className="mt-4 max-w-sm text-text-secondary">{brand.tagline}</p>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-3 transition-opacity duration-300 group-hover:opacity-0">
            {brand.stats.map((stat) => (
              <div key={stat.label}>
                <p className="mono text-sm text-light">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
          <Link
            href={`/brands/${brand.slug}`}
            className="absolute bottom-6 left-6 translate-y-4 text-sm uppercase tracking-[0.14em] text-accent opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            View Brand -&gt;
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
