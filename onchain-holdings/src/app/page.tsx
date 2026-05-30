import { BrandCard } from "@/components/cards/BrandCard";
import { HeroSceneDynamic } from "@/components/3d/HeroSceneDynamic";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { TextReveal } from "@/components/ui/TextReveal";
import { brands } from "@/data/brands";

const marqueeItems = ["PUDGY PENGUINS", "OVERPASS IP", "ABSTRACT CHAIN", "CONSUMER CRYPTO", "ONCHAIN COMMUNITY"];

export default function Home() {
  return (
    <>
      <section className="relative -mt-20 min-h-screen overflow-hidden pt-20">
        <HeroSceneDynamic />
        <div className="site-container relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center text-center">
          <p className="mono mb-6 text-xs uppercase tracking-[0.22em] text-text-secondary">Crypto holding company</p>
          <TextReveal
            as="h1"
            text="Building the Largest Onchain Community."
            className="display max-w-6xl text-[length:var(--text-hero)] leading-[0.82] text-accent text-balance"
            type="words"
          />
          <p className="mt-8 max-w-2xl text-[length:var(--text-body)] leading-8 text-light">The consumer crypto revolution starts here.</p>
          <div className="mt-10">
            <Button href="/brands">Explore Ecosystem</Button>
          </div>
        </div>
      </section>

      <Marquee items={marqueeItems} direction="left" speed={60} />

      <section className="site-container section-y min-h-[60vh] text-center">
        <div className="mx-auto max-w-4xl">
          <TextReveal as="h2" text="We didn't build another protocol. We built a brand." className="display text-[length:var(--text-h1)] leading-none text-accent" />
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 text-[length:var(--text-body)] leading-8 text-text-secondary">
            <p>Our thesis is simple: the next crypto winner will not look like a terminal. It will look like culture.</p>
            <p>We acquire, build, and scale onchain brands with real characters, mainstream distribution, and community ownership.</p>
            <p>The protocol layer matters. The brand layer makes people care.</p>
          </div>
        </div>
      </section>

      <section className="site-container section-y">
        <SectionHeading eyebrow="Our Portfolio" title="Brands designed to move beyond crypto." />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard brand={brand} key={brand.id} />
          ))}
        </div>
      </section>

      <Marquee items={marqueeItems} direction="right" speed={60} />

      <section className="site-container section-y grid gap-8 md:grid-cols-4">
        {[
          { value: 180000, suffix: "+", label: "Holders" },
          { value: 2, prefix: "$", suffix: "B+ NFT Volume", label: "Secondary Market" },
          { value: 3, label: "Portfolio Companies" },
          { value: 5, suffix: "M+ Community Members", label: "Global Reach" },
        ].map((metric) => (
          <div className="border-t border-border pt-6" key={metric.label}>
            <p className="mono text-4xl text-accent md:text-5xl">
              <StatCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.14em] text-text-secondary">{metric.label}</p>
          </div>
        ))}
      </section>

      <section className="section-y bg-surface">
        <div className="site-container">
          <blockquote className="display max-w-6xl text-[length:var(--text-h1)] italic leading-none text-accent">
            &ldquo;The winning onchain company will be remembered less for its contract address and more for the world it made people want to join.&rdquo;
          </blockquote>
          <div className="mt-12 grid gap-8 text-[length:var(--text-body)] leading-8 text-text-secondary md:grid-cols-2">
            <p>We operate like a holding company, a studio, and a distribution engine. Each brand compounds the next through shared infrastructure and shared audience.</p>
            <p>Our work sits at the intersection of IP, protocol design, retail, collectibles, and internet-native community formation.</p>
          </div>
        </div>
      </section>

      <section className="site-container section-y text-center">
        <h2 className="display text-[length:var(--text-h1)] leading-none text-accent">Ready to go onchain?</h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/contact">Get in Touch</Button>
          <Button href="/brands" variant="ghost">Explore Brands</Button>
        </div>
      </section>
    </>
  );
}
