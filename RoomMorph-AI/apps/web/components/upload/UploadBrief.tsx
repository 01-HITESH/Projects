"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Check, Image, Loader2, WandSparkles, X } from "lucide-react";

import type { RedesignPayload } from "@/types/project";

type UploadBriefProps = {
  loading: boolean;
  error: string | null;
  userId: string;
  onSubmit: (payload: RedesignPayload) => Promise<void>;
};

const roomTypes = ["Living room", "Bedroom", "Kitchen", "Home office"];
const themeOptions = ["modern", "luxury", "minimal", "contemporary", "industrial"];
const defaultPalette = ["#f3f0e8", "#9aa58f", "#2f3430", "#c7b299"];

export function UploadBrief({ loading, error, userId, onSubmit }: UploadBriefProps) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [themes, setThemes] = useState(themeOptions.slice(0, 4));
  const [palette, setPalette] = useState(defaultPalette);
  const [constraints, setConstraints] = useState("Keep the room practical, brighter, and easier to maintain.");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }
    await onSubmit({ userId, image: file, roomType, themes, palette, constraints });
  }

  function toggleTheme(theme: string) {
    setThemes((current) =>
      current.includes(theme) ? current.filter((item) => item !== theme) : [...current, theme],
    );
  }

  return (
    <form className="panel flex h-full flex-col gap-5 rounded-lg p-4" onSubmit={submit}>
      <div>
        <p className="text-sm font-medium text-steel">Step 1</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Upload room photo</h2>
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
        <label className="focus-ring flex min-h-48 cursor-pointer overflow-hidden rounded-lg border border-dashed border-ink/18 bg-chalk/70" htmlFor={inputId}>
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

      <label className="space-y-2">
        <span className="text-sm font-medium text-steel">Room type</span>
        <select className="focus-ring h-11 w-full rounded-lg border border-ink/12 bg-chalk px-3 text-sm" value={roomType} onChange={(event) => setRoomType(event.target.value)}>
          {roomTypes.map((item) => <option key={item}>{item}</option>)}
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

      <div className="space-y-2">
        <span className="text-sm font-medium text-steel">Palette</span>
        <div className="grid grid-cols-4 gap-2">
          {palette.map((color, index) => (
            <input
              aria-label={`Palette color ${index + 1}`}
              className="h-10 w-full cursor-pointer rounded-lg border border-ink/12 bg-chalk p-1"
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
        <textarea className="focus-ring min-h-24 resize-none rounded-lg border border-ink/12 bg-chalk px-3 py-3 text-sm" value={constraints} onChange={(event) => setConstraints(event.target.value)} />
      </label>

      {error ? <div className="rounded-lg border border-clay/30 bg-clay/10 px-3 py-2 text-sm">{error}</div> : null}

      <button className="focus-ring mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-chalk transition hover:bg-steel disabled:cursor-not-allowed disabled:bg-ink/35" disabled={!file || loading} type="submit">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        Generate design concepts
      </button>
    </form>
  );
}
