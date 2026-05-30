import { TeamCard } from "@/components/cards/TeamCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { team } from "@/data/team";

export const metadata = { title: "About" };

const timeline = [
  ["2021", "Community-first collecting becomes the portfolio thesis."],
  ["2023", "IP licensing and retail distribution become core operating muscles."],
  ["2025", "Infrastructure strategy expands around consumer-grade onchain apps."],
  ["2026", "The holding company aligns IP, protocol, and distribution under one ecosystem."],
];

export default function AboutPage() {
  return (
    <>
      <section className="site-container section-y">
        <blockquote className="display max-w-6xl text-[length:var(--text-hero)] italic leading-[0.86] text-accent">
          &ldquo;Brands are the interface layer for crypto.&rdquo;
        </blockquote>
      </section>
      <section className="site-container section-y grid gap-10 lg:grid-cols-[0.7fr_1fr]">
        <SectionHeading eyebrow="Company Story" title="A timeline of conviction." />
        <div className="border-l border-border">
          {timeline.map(([year, copy]) => (
            <div className="grid gap-3 border-b border-border py-8 pl-8" key={year}>
              <p className="mono text-sm text-light">{year}</p>
              <p className="text-[length:var(--text-body)] leading-8 text-text-secondary">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="site-container section-y">
        <SectionHeading eyebrow="Mission and Values" title="Build worlds people want to own." />
        <div className="grid gap-5 md:grid-cols-3">
          {["Taste compounds", "Ownership should feel natural", "Distribution is strategy"].map((value) => (
            <article className="border border-border bg-surface p-6" key={value}>
              <h3 className="display text-3xl text-accent">{value}</h3>
              <p className="mt-6 text-text-secondary">We choose the hard brand work that makes infrastructure meaningful to normal people.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="site-container section-y">
        <SectionHeading eyebrow="Team" title="Operators for culture, code, and capital." />
        <div className="grid gap-5 md:grid-cols-3">
          {team.map((member) => (
            <TeamCard member={member} key={member.name} />
          ))}
        </div>
      </section>
      <section className="site-container pb-24">
        <div className="grid gap-4 border-y border-border py-8 text-center mono text-xs uppercase tracking-[0.18em] text-text-secondary md:grid-cols-5">
          {["Forbes", "Bloomberg", "Decrypt", "Vogue Business", "Awwwards"].map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </section>
    </>
  );
}
