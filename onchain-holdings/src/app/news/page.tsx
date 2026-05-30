import { ArticleCard } from "@/components/cards/ArticleCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { articles } from "@/data/news";

export const metadata = { title: "News" };

export default function NewsPage() {
  return (
    <section className="site-container section-y">
      <SectionHeading eyebrow="News" title="Field notes from the consumer crypto frontier." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard article={article} key={article.slug} />
        ))}
      </div>
    </section>
  );
}
