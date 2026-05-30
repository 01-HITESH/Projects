import { JobCard } from "@/components/cards/JobCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { jobs } from "@/data/news";

export const metadata = { title: "Careers" };

export default function CareersPage() {
  const departments = Array.from(new Set(jobs.map((job) => job.department)));

  return (
    <section className="site-container section-y">
      <SectionHeading eyebrow="Careers" title="Join the company building the brand layer of crypto." />
      <div className="grid gap-12">
        {departments.map((department) => (
          <div key={department}>
            <h2 className="mono mb-4 text-sm uppercase tracking-[0.18em] text-text-secondary">{department}</h2>
            <div className="grid gap-4">
              {jobs.filter((job) => job.department === department).map((job) => (
                <JobCard job={job} key={job.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
