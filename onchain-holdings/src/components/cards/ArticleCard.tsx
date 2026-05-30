import Link from "next/link";
import type { Article } from "@/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/news/${article.slug}`} className="group block border border-border bg-surface p-6 transition duration-200 hover:border-accent">
      <p className="mono text-xs uppercase tracking-[0.16em] text-text-secondary">
        {article.tag} / {new Date(article.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      <h2 className="display mt-8 text-[length:var(--text-h3)] leading-tight text-accent">{article.title}</h2>
      <p className="mt-4 text-text-secondary">{article.excerpt}</p>
      <p className="mt-10 text-sm uppercase tracking-[0.14em] text-light">Read Article -&gt;</p>
    </Link>
  );
}
