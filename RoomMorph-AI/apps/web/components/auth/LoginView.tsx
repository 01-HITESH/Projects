"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, BadgeIndianRupee, Box, Home, Layers3, Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { LoginHeroScene } from "@/components/auth/LoginHeroScene";
import type { User } from "@/types/project";

type LoginViewProps = {
  loading: boolean;
  error: string | null;
  onLogin: (email: string, name: string) => Promise<User | void>;
};

export function LoginView({ loading, error, onLogin }: LoginViewProps) {
  const [name, setName] = useState("Demo Designer");
  const [email, setEmail] = useState("designer@roommorph.local");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(email, name);
  }

  return (
    <main className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-lg border border-ink/10 bg-ink text-chalk shadow-panel">
          <LoginHeroScene />
          <div className="relative flex min-h-[650px] flex-col justify-between p-5 sm:p-8 lg:p-10">
            <div className="eyebrow border-chalk/18 bg-chalk/10 text-chalk backdrop-blur">
            <Home className="h-4 w-4" />
            RoomMorph AI
          </div>
            <div aria-hidden="true" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={<Sparkles className="h-4 w-4" />} label="Concepts" value="5 themes" />
              <Metric icon={<Box className="h-4 w-4" />} label="Viewer" value="360 room" />
              <Metric icon={<BadgeIndianRupee className="h-4 w-4" />} label="Report" value="Budget ready" />
            </div>
          </div>
        </section>

        <form className="panel rounded-lg p-5 shadow-panel sm:p-6" onSubmit={submit}>
          <div className="mb-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-chalk">
              <Layers3 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-steel">Designer access</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Open your workspace</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              A local sign-in keeps project history separated for presentation and review.
            </p>
          </div>
          <label className="mb-4 block space-y-2">
            <span className="text-sm font-medium text-steel">Name</span>
            <input
              className="field focus-ring w-full px-3 text-sm"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-steel">Email</span>
            <input
              className="field focus-ring w-full px-3 text-sm"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {error ? <div className="mt-4 rounded-lg border border-clay/30 bg-clay/10 px-3 py-2 text-sm">{error}</div> : null}
          <button
            className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-chalk transition hover:bg-steel disabled:bg-ink/35"
            disabled={loading}
            type="submit"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-chalk/18 bg-chalk/12 px-3 py-3 backdrop-blur">
      <p className="flex items-center gap-2 text-xs font-medium text-chalk/72">{icon}{label}</p>
      <p className="mt-1 text-sm font-semibold text-chalk">{value}</p>
    </div>
  );
}
