import { BrandCard } from "@/components/cards/BrandCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brands } from "@/data/brands";

export const metadata = { title: "Brands" };

export default function BrandsPage() {
  return (
    <div className="site-container section-y">
      <SectionHeading eyebrow="Portfolio" title="The ecosystem is the product." copy="Each company is built to stand alone and compound the others." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <BrandCard brand={brand} key={brand.id} />
        ))}
      </div>
    </div>
  );
}
