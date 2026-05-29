"use client";

import { Boxes, GitBranch, Layers3, SlidersHorizontal, TimerReset, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

const decisionCards = [
  {
    icon: <GitBranch className="h-4 w-4" />,
    title: "Linear vs. Iterative",
    body: "A strict upload, render, then 3D path is easier to explain and cache. Free iteration is better for experts, but every loop needs version history, invalidation rules, and clear cost feedback.",
  },
  {
    icon: <SlidersHorizontal className="h-4 w-4" />,
    title: "Controls vs. Prompts",
    body: "Buttons make common room edits predictable. Prompt commands add flexibility, but require intent parsing, conflict handling, undo, and stronger previews before users trust the result.",
  },
  {
    icon: <Boxes className="h-4 w-4" />,
    title: "3D Export Scope",
    body: "Designers need image fidelity and mood boards first. Architects care about geometry handoff. Clients need shareable walkthroughs. Pick one primary persona before adding many formats.",
  },
  {
    icon: <TimerReset className="h-4 w-4" />,
    title: "Sequential vs. Parallel",
    body: "Parallel jobs feel faster when both outputs are useful independently. Sequential work is safer when the 3D model must inherit decisions from the approved render.",
  },
] as const;

const riskItems = [
  "If users can regenerate any step, projects need output versions, lineage, and rollback.",
  "If 3D generation starts before render approval, mismatches between image style and geometry become product debt.",
  "If you expose advanced parameters, presets and defaults must explain the practical impact.",
  "If export is promised early, scale, units, textures, and licensing become core requirements.",
] as const;

const validationItems = [
  "Which output would you pay for first: photoreal image, editable 3D model, or client walkthrough?",
  "What does a failed conversion look like for your workflow?",
  "Which edits must remain under your control before you trust an automated result?",
  "What format or destination tool makes the output immediately useful?",
] as const;

export function WorkflowStrategy() {
  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-steel">Product strategy</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">2D to photoreal render to 3D model stress test</h2>
          <p className="mt-2 max-w-3xl text-sm leading-5 text-ink/58">
            Use this as a decision map before committing to the full design-to-reality workflow architecture.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-chalk px-3 py-1.5 text-sm font-medium text-ink">
          <Layers3 className="h-4 w-4 text-steel" />
          Exploration mode
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {decisionCards.map((item) => (
          <StrategyCard key={item.title} icon={item.icon} title={item.title}>
            {item.body}
          </StrategyCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <NotePanel icon={<GitBranch className="h-4 w-4" />} title="Hidden dependencies" items={riskItems} />
        <NotePanel icon={<UsersRound className="h-4 w-4" />} title="Validation questions" items={validationItems} />
      </div>
    </section>
  );
}

function StrategyCard({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <article className="rounded-lg border border-ink/10 bg-chalk p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-mist text-steel">{icon}</span>
        {title}
      </div>
      <p className="text-sm leading-5 text-ink/62">{children}</p>
    </article>
  );
}

function NotePanel({ icon, items, title }: { icon: ReactNode; items: readonly string[]; title: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-chalk p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {title}
      </div>
      <ul className="space-y-2 text-sm leading-5 text-ink/66">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
