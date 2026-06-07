# Architecture

```text
[Next.js Upload UI]
  -> [FastAPI API]
    -> image validation + local asset storage
    -> OpenAI image edit provider for photoreal redesign concepts
    -> design variant gallery
    -> design intelligence report
    -> selected design scene builder
    -> JSON project store + static assets
  -> [React Three Fiber 3D viewer]
    -> walkthrough controls
    -> furniture/material/light customization
    -> layout analytics and material schedule
    -> before/after comparison
```

The redesign concept step now calls a hosted image-to-image provider by default. The
current provider is OpenAI's Image API edit endpoint, which takes the uploaded room photo
and a design prompt, then returns a photoreal concept image. A deterministic local renderer
still exists behind `IMAGE_GENERATION_PROVIDER=local` for UI testing without API usage.

The 3D scene builder remains a structured local scene generator. It creates editable
web primitives from the selected concept's theme, palette, material plan, and budget
metadata; it does not reconstruct production-grade geometry from the generated image.

The current local intelligence layer ranks concepts with style, feasibility, budget,
maintenance, and sustainability scores. It also generates an estimated INR budget,
timeline, material schedule, clearance notes, lighting plan, and sustainability notes
from the selected brief and generated 3D layout.
