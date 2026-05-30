import Link from "next/link";
import type { Job } from "@/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/careers/${job.id}`} className="grid gap-4 border border-border bg-surface p-6 transition duration-200 hover:border-accent md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <h3 className="display text-3xl text-accent">{job.title}</h3>
        <p className="mt-2 text-text-secondary">{job.location}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="border border-border px-3 py-1 text-xs uppercase tracking-[0.14em] text-light">{job.type}</span>
        {job.remote ? <span className="border border-border px-3 py-1 text-xs uppercase tracking-[0.14em] text-light">Remote</span> : null}
      </div>
    </Link>
  );
}
