"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Check, Image, Loader2, PlugZap, WandSparkles, X } from "lucide-react";

import { getGenerationStatus } from "@/lib/api";
import type { GenerationStatus, RedesignPayload } from "@/types/project";

type UploadBriefProps = {
  loading: boolean;
  error: string | null;
  userId: string;
  onSubmit: (payload: RedesignPayload) => Promise<void>;
};

const roomTypes = ["Living room", "Bedroom", "Kitchen", "Home office"];
const themeOptions = ["modern", "luxury", "minimal", "contemporary", "industrial"];
const budgetOptions = ["Starter", "Balanced", "Premium", "Luxury"];
const lifestyleOptions = ["Everyday family use", "Rental apartment", "Work from home", "Kids and pets", "Compact city home"];
const priorityOptions = [
  { value: "balanced", label: "Balanced" },
  { value: "practicality", label: "Practicality" },
  { value: "sustainability", label: "Sustainability" },
  { value: "premium finish", label: "Premium finish" },
];
const defaultPalette = ["#f3f0e8", "#9aa58f", "#2f3430", "#c7b299"];

export function UploadBrief({ loading, error, userId, onSubmit }: UploadBriefProps) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [themes, setThemes] = useState(themeOptions.slice(0, 4));
  const [palette, setPalette] = useState(defaultPalette);
  const [budgetRange, setBudgetRange] = useState("Balanced");
  const [lifestyle, setLifestyle] = useState(lifestyleOptions[0]);
  const [priority, setPriority] = useState("balanced");
  const [constraints, setConstraints] = useState("Keep the room practical, brighter, and easier to maintain.");
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let active = true;

    async function loadGenerationStatus() {
      setStatusLoading(true);
      try {
        const status = await getGenerationStatus();
        if (active) {
          setGenerationStatus(status);
        }
      } catch (statusError) {
        if (active) {
          setGenerationStatus({
            provider: "unknown",
            ready: false,
            message: statusError instanceof Error ? statusError.message : "Image generator status is unavailable.",
          });
        }
      } finally {
        if (active) {
          setStatusLoading(false);
        }
      }
    }

    void loadGenerationStatus();
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }
    await onSubmit({
      userId,
      image: file,
      roomType,
      themes,
      palette,
      constraints,
      budgetRange,
      lifestyle,
      priority,
    });
  }

  function toggleTheme(theme: string) {
    setThemes((current) =>
      current.includes(theme) ? current.filter((item) => item !== theme) : [...current, theme],
    );
  }

  return (
    <form className="panel flex h-full flex-col gap-5 rounded-lg p-4" onSubmit={submit}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-steel">Step 1</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">Upload room photo</h2>
          </div>
          <GeneratorBadge loading={statusLoading} status={generationStatus} />
        </div>
        <p className="mt-2 text-sm leading-5 text-ink/58">Generate local concept directions from a 2D room image and a practical design brief.</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-steel" htmlFor={inputId}>Image</label>
          {file ? (
            <button
              aria-label="Clear image"
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink/10 hover:bg-ink hover:text-chalk"
              type="button"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <label className="focus-ring flex min-h-48 cursor-pointer overflow-hidden rounded-lg border border-dashed border-ink/18 bg-chalk/80 transition hover:border-steel/45 hover:bg-chalk" htmlFor={inputId}>
          {preview ? (
            <img alt="" className="h-48 w-full object-cover" src={preview} />
          ) : (
            <span className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-ink/65">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-chalk">
                <Image className="h-5 w-5" />
              </span>
              Upload a plain or messy room
            </span>
          )}
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id={inputId}
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-steel">Room type</span>
          <select className="field focus-ring w-full px-3 text-sm" value={roomType} onChange={(event) => setRoomType(event.target.value)}>
            {roomTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-steel">Budget range</span>
          <select className="field focus-ring w-full px-3 text-sm" value={budgetRange} onChange={(event) => setBudgetRange(event.target.value)}>
            {budgetOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-steel">Lifestyle</span>
        <select className="field focus-ring w-full px-3 text-sm" value={lifestyle} onChange={(event) => setLifestyle(event.target.value)}>
          {lifestyleOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-steel">Themes</legend>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((theme) => {
            const active = themes.includes(theme);
            return (
              <button
                className={[
                  "focus-ring inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition",
                  active ? "border-ink bg-ink text-chalk" : "border-ink/12 bg-chalk text-ink hover:border-steel",
                ].join(" ")}
                key={theme}
                type="button"
                onClick={() => toggleTheme(theme)}
              >
                {active ? <Check className="h-3.5 w-3.5" /> : null}
                {theme}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-steel">Decision priority</legend>
        <div className="grid grid-cols-2 gap-2">
          {priorityOptions.map((item) => {
            const active = priority === item.value;
            return (
              <button
                className={[
                  "focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",
                  active ? "border-ink bg-ink text-chalk" : "border-ink/12 bg-chalk text-ink hover:border-steel",
                ].join(" ")}
                key={item.value}
                type="button"
                onClick={() => setPriority(item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <span className="text-sm font-medium text-steel">Palette</span>
        <div className="grid grid-cols-4 gap-2">
          {palette.map((color, index) => (
            <input
              aria-label={`Palette color ${index + 1}`}
              className="h-10 w-full cursor-pointer rounded-lg border border-ink/12 bg-chalk p-1 shadow-sm"
              key={`${color}-${index}`}
              type="color"
              value={color}
              onChange={(event) => {
                const next = [...palette];
                next[index] = event.target.value;
                setPalette(next);
              }}
            />
          ))}
        </div>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-steel">Design notes</span>
        <textarea className="field focus-ring min-h-24 w-full resize-none px-3 py-3 text-sm" value={constraints} onChange={(event) => setConstraints(event.target.value)} />
      </label>

      {error ? <div className="rounded-lg border border-clay/30 bg-clay/10 px-3 py-2 text-sm">{error}</div> : null}

      <button className="focus-ring mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-chalk transition hover:bg-steel disabled:cursor-not-allowed disabled:bg-ink/35" disabled={!file || loading} type="submit">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        Generate concepts
      </button>
    </form>
  );
}

function GeneratorBadge({
  loading,
  status,
}: {
  loading: boolean;
  status: GenerationStatus | null;
}) {
  const provider = status?.provider === "automatic1111" ? "A1111" : status?.provider ?? "Generator";
  const ready = Boolean(status?.ready);

  return (
    <div
      className={[
        "inline-flex max-w-[11rem] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
        ready ? "border-sage/30 bg-sage/10 text-ink" : "border-clay/30 bg-clay/10 text-ink",
      ].join(" ")}
      title={status?.message ?? "Checking image generator status."}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
      <span className="truncate">
        {loading ? "Checking" : `${provider}: ${ready ? "ready" : "offline"}`}
      </span>
    </div>
  );
}
