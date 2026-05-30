import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { articles, getArticle } from "@/data/news";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  return { title: article?.title || "Article" };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();
  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <>
      <article className="site-container section-y">
        <p className="mono text-xs uppercase tracking-[0.18em] text-text-secondary">
          {article.author} / {new Date(article.date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })} / {article.readTime}
        </p>
        <h1 className="display mt-6 max-w-5xl text-[length:var(--text-h1)] leading-none text-accent">{article.title}</h1>
        <div className="relative mt-12 aspect-[16/9] overflow-hidden border border-border">
          <Image src={article.coverImage} alt={article.title} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-7 text-[length:var(--text-body)] leading-8 text-text-secondary">
          {article.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
      <section className="site-container pb-24">
        <h2 className="display mb-8 text-[length:var(--text-h2)] text-accent">Related</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {related.map((item) => (
            <ArticleCard article={item} key={item.slug} />
          ))}
        </div>
      </section>
    </>
  );
}
