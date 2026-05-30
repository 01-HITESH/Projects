import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  copy?: string;
};

export function SectionHeading({ copy, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mb-12 max-w-4xl">
      {eyebrow ? <p className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-secondary">{eyebrow}</p> : null}
      <h2 className="display text-[length:var(--text-h1)] leading-[0.92] text-accent text-balance">{title}</h2>
      {copy ? <p className="mt-6 max-w-2xl text-[length:var(--text-body)] leading-8 text-text-secondary">{copy}</p> : null}
    </div>
  );
}
