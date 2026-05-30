"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = [
  ["About", "/about"],
  ["Brands", "/brands"],
  ["News", "/news"],
  ["Careers", "/careers"],
  ["Contact", "/contact"],
];

export function MobileMenu({ close }: { close: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="fixed inset-x-4 top-20 z-50 border border-border bg-surface p-4 md:hidden"
    >
      <nav className="grid gap-2" aria-label="Mobile navigation">
        {links.map(([label, href]) => (
          <Link className="py-4 text-2xl text-light" href={href} key={href} onClick={close}>
            {label}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
