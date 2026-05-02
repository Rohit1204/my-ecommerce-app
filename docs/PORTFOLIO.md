# Using this project in your portfolio

## One-line pitch

> Full-stack ecommerce demo: **Next.js storefront** + **Django REST API** with **JWT auth**, **idempotent checkout**, **Paytm-style payment handoff**, and **OpenAPI** docs — structured like a migration from a legacy Django shop to a modern frontend.

## What to highlight in interviews

1. **Why split frontend and API** — Independent deploys, clear contract (OpenAPI), CORS and JWT tradeoffs.
2. **Auth story** — Email activation, JWT for API, **checkout gated** to logged-in users; refresh token available for extension.
3. **Commerce safety** — **User FK on orders**, **idempotency key** to prevent duplicate orders on double-submit / flaky networks.
4. **Incremental migration** — Legacy Django URLs redirect to Next; shared `localStorage` cart key for a transitional story.
5. **Testing** — API tests on money/auth paths; frontend unit tests on validation and redirect safety.

## Suggested README bullets for CV / LinkedIn

- Designed and implemented a **Next.js 15** storefront consuming a **Django REST** catalog and order API.
- Implemented **JWT authentication**, **email activation**, and **authenticated checkout** with **idempotent order creation**.
- Integrated **Paytm checksum** flow (staging) and **drf-spectacular** OpenAPI documentation.
- Added **automated tests** (Django API + Vitest) for critical checkout and validation paths.

## Demo checklist before sharing

- [ ] Run Django + Next locally; confirm home, search, PDP, login, checkout, tracker.
- [ ] Mention in README or cover letter: **demo only**, no real payments unless keys configured.
- [ ] Optional: deploy API (Railway/Fly/Render) + Vercel for Next; set env vars; update `NEXT_PUBLIC_API_URL` and CORS.

## Ideas for the next iteration (if asked “what’s next?”)

- PostgreSQL + Docker Compose; CI (lint + tests) on PR.
- Server-side cart or Redis session; tie line items to `Product` rows at checkout.
- httpOnly refresh cookies; rate limiting on register/login.
- Observability: structured logs + request ID middleware.
