import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="site-container grid gap-12 py-16 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="display max-w-2xl text-[length:var(--text-h2)] leading-none text-accent">
            Building consumer crypto brands with gravity.
          </p>
          <div className="mt-8">
            <Button href="/contact">Get in Touch</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm uppercase tracking-[0.12em] text-text-secondary">
          <div className="grid gap-3">
            <Link href="/about">About</Link>
            <Link href="/brands">Brands</Link>
            <Link href="/news">News</Link>
          </div>
          <div className="grid gap-3">
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
            <a href="https://vercel.com" target="_blank" rel="noreferrer">
              Vercel
            </a>
          </div>
        </div>
      </div>
      <div className="site-container flex flex-col gap-2 border-t border-border py-6 text-xs uppercase tracking-[0.16em] text-text-secondary md:flex-row md:items-center md:justify-between">
        <span>Onchain Holdings</span>
        <span className="mono">ETH 0x0H...2026</span>
      </div>
    </footer>
  );
}
