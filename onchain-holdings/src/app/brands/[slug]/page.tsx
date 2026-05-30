import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { getBrand, brands } from "@/data/brands";

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const brand = getBrand(params.slug);
  return { title: brand?.name || "Brand" };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brand = getBrand(params.slug);
  if (!brand) notFound();

  return (
    <>
      <section className="relative -mt-20 min-h-screen overflow-hidden pt-20">
        <Image src={brand.coverImage} alt={`${brand.name} cover`} fill priority sizes="100vw" className="object-cover opacity-55" />
        <div className="absolute inset-0 bg-bg/45" />
        <div className="site-container relative z-10 flex min-h-[calc(100vh-5rem)] flex-col justify-end pb-16">
          <p className="mono text-xs uppercase tracking-[0.2em] text-light">Portfolio Brand</p>
          <h1 className="display mt-6 max-w-5xl text-[length:var(--text-hero)] leading-[0.84] text-accent">{brand.name}</h1>
          <p className="mt-6 max-w-2xl text-[length:var(--text-body)] leading-8 text-light">{brand.tagline}</p>
        </div>
      </section>

      <section className="site-container section-y grid gap-12 lg:grid-cols-2">
        <div>
          <p className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-secondary">Brand Story</p>
          <h2 className="display text-[length:var(--text-h1)] leading-none text-accent">From culture to distribution.</h2>
        </div>
        <div className="grid gap-6 text-[length:var(--text-body)] leading-8 text-text-secondary">
          {brand.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="site-container grid gap-6 py-12 md:grid-cols-3">
        {brand.stats.map((stat) => (
          <div className="border-t border-border pt-6" key={stat.label}>
            <p className="mono text-4xl text-accent">{stat.value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="site-container section-y">
        <div className="columns-1 gap-5 md:columns-2">
          {brand.gallery.map((image) => (
            <div className="relative mb-5 aspect-[4/3] overflow-hidden border border-border" key={image}>
              <Image src={image} alt={`${brand.name} gallery`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <Marquee items={brand.partners} direction="left" />

      <section className="site-container section-y text-center">
        <h2 className="display text-[length:var(--text-h1)] leading-none text-accent">Enter {brand.name}.</h2>
        <div className="mt-8">
          <Button href={brand.externalUrl}>Visit Website</Button>
        </div>
      </section>
    </>
  );
}
