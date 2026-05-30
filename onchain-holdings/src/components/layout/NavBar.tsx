"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

const links = [
  ["About", "/about"],
  ["Brands", "/brands"],
  ["News", "/news"],
  ["Careers", "/careers"],
  ["Contact", "/contact"],
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-4 z-[90] bg-accent px-4 py-2 text-bg"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-bg/85 backdrop-blur-xl">
        <div className="site-container flex h-20 items-center justify-between">
          <Link className="display text-2xl text-accent" href="/" aria-label="Onchain Holdings home">
            OH
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link className="text-sm uppercase tracking-[0.12em] text-text-secondary transition hover:text-accent" href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <button
            className="grid h-11 w-11 place-items-center border border-border text-light md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      <AnimatePresence>{open ? <MobileMenu close={() => setOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}
