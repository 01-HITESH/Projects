# Architecture

```text
[Next.js Upload UI]
  -> [FastAPI API]
    -> image validation + local asset storage
    -> local AUTOMATIC1111 img2img or optional OpenAI image edit provider
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

The redesign concept step now calls a real image-to-image provider by default. The
default provider is AUTOMATIC1111 Stable Diffusion WebUI running locally with `--api`;
it takes the uploaded room photo and a design prompt, then returns a photoreal concept
image through its `img2img` endpoint. OpenAI's Image API edit endpoint remains available
as `IMAGE_GENERATION_PROVIDER=openai`. A deterministic local renderer still exists behind
`IMAGE_GENERATION_PROVIDER=local` for UI testing without AI usage.

The 3D scene builder remains a structured local scene generator. It creates editable
web primitives from the selected concept's theme, palette, material plan, and budget
metadata; it does not reconstruct production-grade geometry from the generated image.

The current local intelligence layer ranks concepts with style, feasibility, budget,
maintenance, and sustainability scores. It also generates an estimated INR budget,
timeline, material schedule, clearance notes, lighting plan, and sustainability notes
from the selected brief and generated 3D layout.
