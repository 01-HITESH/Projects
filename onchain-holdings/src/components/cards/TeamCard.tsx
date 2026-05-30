import Image from "next/image";
import type { TeamMember } from "@/types";

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="border border-border bg-surface">
      <div className="relative aspect-[4/5]">
        <Image src={member.image} alt={member.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="display text-3xl text-accent">{member.name}</h3>
        <p className="mono mt-2 text-xs uppercase tracking-[0.16em] text-text-secondary">{member.role}</p>
        <p className="mt-4 text-text-secondary">{member.bio}</p>
      </div>
    </article>
  );
}
