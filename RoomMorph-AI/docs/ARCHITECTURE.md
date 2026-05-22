# Architecture

```text
[Next.js Upload UI]
  -> [FastAPI API]
    -> image validation + local asset storage
    -> AI-style redesign generator
    -> design variant gallery
    -> selected design scene builder
    -> JSON project store + static assets
  -> [React Three Fiber 3D viewer]
    -> walkthrough controls
    -> furniture/material/light customization
    -> before/after comparison
```

The prototype uses deterministic local fallbacks in place of external Stable Diffusion,
ControlNet, segmentation, and 3D asset generation services. The API boundaries are
designed so hosted model calls can replace these services later.

