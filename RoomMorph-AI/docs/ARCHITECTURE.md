# Architecture

```text
[Next.js Upload UI]
  -> [FastAPI API]
    -> image validation + local asset storage
    -> deterministic redesign generator
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

The prototype uses a deterministic local renderer in place of external Stable Diffusion,
ControlNet, segmentation, and 3D asset generation services. The API boundaries are
designed so hosted model calls can replace these services later if that product decision
is revisited.

The current local intelligence layer ranks concepts with style, feasibility, budget,
maintenance, and sustainability scores. It also generates an estimated INR budget,
timeline, material schedule, clearance notes, lighting plan, and sustainability notes
from the selected brief and generated 3D layout.
