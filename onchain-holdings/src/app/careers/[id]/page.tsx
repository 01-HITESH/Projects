import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getJob, jobs } from "@/data/news";

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const job = getJob(params.id);
  return { title: job?.title || "Job" };
}

export default function JobPage({ params }: { params: { id: string } }) {
  const job = getJob(params.id);
  if (!job) notFound();

  return (
    <section className="site-container section-y grid gap-12 lg:grid-cols-[0.8fr_1fr]">
      <div>
        <p className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-secondary">{job.department}</p>
        <h1 className="display text-[length:var(--text-h1)] leading-none text-accent">{job.title}</h1>
        <p className="mt-6 text-text-secondary">{job.location} / {job.type} / {job.remote ? "Remote" : "Office"}</p>
        <div className="mt-8">
          <Button href={job.greenhouseUrl}>Apply Now</Button>
        </div>
      </div>
      <article className="grid gap-8 text-[length:var(--text-body)] leading-8 text-text-secondary">
        <p>{job.description}</p>
        <div>
          <h2 className="display mb-4 text-3xl text-accent">Requirements</h2>
          <ul className="grid gap-3">
            {job.requirements.map((requirement) => (
              <li className="border-b border-border pb-3" key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
