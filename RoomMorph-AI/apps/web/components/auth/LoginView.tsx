"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Home, Loader2 } from "lucide-react";

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
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-chalk px-3 py-1.5 text-sm font-medium text-steel">
            <Home className="h-4 w-4" />
            RoomMorph AI
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Interior redesign workspace for AI concepts and 360 rooms
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/66">
            Sign in to view your previous projects, create new redesigns, compare before and after images, and customize generated 3D interiors.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Concepts" value="5 themes" />
            <Metric label="Viewer" value="360 room" />
            <Metric label="History" value="Saved work" />
          </div>
        </section>

        <form className="panel rounded-lg p-5 shadow-soft" onSubmit={submit}>
          <div className="mb-6">
            <p className="text-sm font-medium text-steel">Welcome</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Log in</h2>
          </div>
          <label className="mb-4 block space-y-2">
            <span className="text-sm font-medium text-steel">Name</span>
            <input
              className="focus-ring h-11 w-full rounded-lg border border-ink/12 bg-chalk px-3 text-sm"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-steel">Email</span>
            <input
              className="focus-ring h-11 w-full rounded-lg border border-ink/12 bg-chalk px-3 text-sm"
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-chalk px-3 py-3">
      <p className="text-xs font-medium text-steel">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
