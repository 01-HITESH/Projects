# Phase 2 Checkpoint

Status: continued after asset/telemetry wiring and production verification.

Implemented:
- Next.js 14 App Router site with TypeScript strict mode and Tailwind CSS.
- Premium dark brand system, global tokens, layout shell, navigation, footer, page transitions, and scroll progress.
- Homepage with 3D hero fallback, marquees, mission, portfolio grid, metrics, manifesto, and CTA.
- Brands, brand detail, about, contact, news/article, careers/job pages.
- React Hook Form + Zod contact flow with server action, optional Neon insert, Resend email, and Upstash rate limit.
- Static JSON-style TypeScript data for brands, team, news, and jobs.
- Local SVG visual assets for covers, team, logos, and article imagery.
- Hero scene now supports a DRACO-compressed `/public/models/hero-character.glb` with a self-hosted `/public/draco` decoder and procedural fallback.
- Self-hosted `@font-face` hooks are wired behind `NEXT_PUBLIC_ENABLE_SELF_HOSTED_FONTS`.
- PostHog provider is wired behind `NEXT_PUBLIC_POSTHOG_KEY`.
- Sentry client/server/edge initialization files and Next config are wired behind real DSNs.

Verified:
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd run build

Next phase:
- Add the licensed font binaries as `/public/fonts/onchain-display.woff2`, `/public/fonts/onchain-sans.woff2`, and `/public/fonts/onchain-mono.woff2`, then set `NEXT_PUBLIC_ENABLE_SELF_HOSTED_FONTS=true`.
- Add the DRACO-compressed hero model at `/public/models/hero-character.glb`, then set `NEXT_PUBLIC_ENABLE_HERO_MODEL=true`.
- Add real `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, and Sentry upload credentials when available.
- Run screenshot QA with browser tooling after Playwright or equivalent is added.
