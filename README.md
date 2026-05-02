# ShopHub · E-commerce demo

**Repository:** [github.com/Rohit1204/my-ecommerce-app](https://github.com/Rohit1204/my-ecommerce-app)

A portfolio-grade **full-stack marketplace**: **Next.js 15** (TypeScript, Tailwind) for the storefront, **Django 5** + **Django REST Framework** for the API, **JWT** auth, **idempotent checkout**, optional **Paytm** staging handoff, and **OpenAPI** docs. Customer-facing HTML is on **Next.js**; Django serves the API, Paytm callback, and admin.

| | |
|---|---|
| **Live story** | Browse → bag (localStorage) → **login** → checkout → order id → **track** with email |
| **Docs** | [Architecture](docs/ARCHITECTURE.md) · [Portfolio talking points](docs/PORTFOLIO.md) |
| **API explorer** | Swagger at `/api/docs/` when Django is running |

## Stack

| Layer | Technology |
|--------|------------|
| Storefront | **Next.js 15** (App Router), React 19, Tailwind |
| API | **Django 5**, **DRF**, **SimpleJWT**, **CORS**, **drf-spectacular** |
| Auth | JWT (`/api/v1/auth/token/`), email activation → Next.js `/activate/...` |
| DB | SQLite by default; PostgreSQL-ready via settings |
| Payments | Paytm-style checksum + browser POST (optional, env-driven) |
| Deploy | Gunicorn ([`Procfile`](Procfile)) |

## Features (portfolio highlights)

- **Product catalog** from `GET /api/v1/catalog/` — home, search, PDP, related products.
- **Cart** in `localStorage` (key `cart`), shared with legacy port 8000 paths if needed.
- **Checkout** on Next.js — **requires login**; `POST /api/v1/orders/` with **Bearer** token.
- **Orders** store **`user` FK** + optional **`idempotency_key`** — safe retries (same key → same order, `200` + `idempotent: true`).
- **Tracker** — order id + email → timeline + line items.
- **Support** — `POST /api/v1/contact/` persists to Django `Contact`.
- **Staff API** — `POST /api/v1/products/` (JWT + `is_staff`) to create catalog items.
- **Tests** — `python manage.py test api.tests` · `cd frontend && npm test`.

## Quick start

### 1. Django (API + admin + media)

```bash
git clone https://github.com/Rohit1204/my-ecommerce-app.git
cd my-ecommerce-app

python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env        # edit secrets / CORS / frontend URL
python manage.py migrate
python manage.py runserver
```

- **API / docs:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) — `createsuperuser` first.

### 2. Next.js storefront

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure `.env` has `DJANGO_CORS_ALLOWED_ORIGINS` including your Next origin (see [`.env.example`](.env.example)).

### 3. Tests

```bash
# Backend (from repo root, venv on)
python manage.py test api.tests

# Frontend
cd frontend && npm test
```

## API reference (short)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/catalog/` | Categories + products |
| GET | `/api/v1/products/<id>/` | Product detail |
| GET | `/api/v1/products/search/?q=` | Search |
| POST | `/api/v1/products/` | Create product — **JWT + staff** |
| POST | `/api/v1/auth/register/` | Sign up (inactive + email) |
| POST | `/api/v1/auth/activate/` | Activate account |
| POST | `/api/v1/auth/token/` | JWT obtain |
| POST | `/api/v1/auth/token/refresh/` | JWT refresh |
| POST | `/api/v1/orders/` | **Create order** — **JWT**; body includes optional `idempotency_key` |
| POST | `/api/v1/orders/track/` | Track order (`order_id`, `email`) |
| POST | `/api/v1/contact/` | Support message |

Full schemas: **Swagger** `/api/docs/`, **ReDoc** `/api/redoc/`, raw schema `/api/schema/`.

Example — create product as staff:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Demo","category":"Electronics","price":999,"desc":"Short description."}'
```

## Configuration

Copy [`.env.example`](.env.example) → `.env`. Important variables:

| Variable | Purpose |
|----------|---------|
| `DJANGO_SECRET_KEY` | Required for any real deploy |
| `DJANGO_DEBUG` | `false` in production |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Next.js origin(s) |
| `DJANGO_FRONTEND_BASE_URL` | Activation links & redirects (no trailing slash) |
| `PAYTM_MID`, `PAYTM_MERCHANT_KEY`, `PAYTM_CALLBACK_URL` | Optional payment handoff |

Optional: `Ecommerce/local_settings.py` for PostgreSQL (do not commit secrets).

## Project layout

```
Ecommerce/          # Django project (settings, urls, wsgi)
api/                # REST: catalog, auth, orders, contact, OpenAPI
api/tests/          # API tests
flipkart/           # Models, admin, Paytm callback, email templates
frontend/           # Next.js app
docs/               # Architecture & portfolio notes
PayTm/              # Checksum helpers
```

## Production notes

1. `DJANGO_DEBUG=false`, strong `DJANGO_SECRET_KEY`, correct `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS` / `CORS_ALLOWED_ORIGINS`.
2. Use PostgreSQL (or managed DB); run migrations.
3. Gunicorn behind a reverse proxy; `collectstatic` for Django static assets.
4. Set `NEXT_PUBLIC_API_URL` to the **public** API URL.

### Django on Heroku + Next.js elsewhere (typical for this repo)

This repository’s `Procfile` starts **only** the Django API (`gunicorn`). The Next.js storefront in `frontend/` is **not** started by that dyno—you deploy it as a **second** service.

| Service | Example host | Role |
|--------|----------------|------|
| **Heroku** | `https://your-api.herokuapp.com` | REST API, admin, Paytm callback, activation emails |
| **Vercel** (or Netlify, second Heroku app, Railway, etc.) | `https://your-app.vercel.app` | Next.js storefront |

**On Heroku (Django), set:**

- `DJANGO_ALLOWED_HOSTS` — include your Heroku hostname (and custom API domain if any).
- `DJANGO_CORS_ALLOWED_ORIGINS` — your **Next.js origin** only (e.g. `https://your-app.vercel.app`).
- `DJANGO_CSRF_TRUSTED_ORIGINS` — same origins you use for the browser + API (see Django docs for your setup).
- `DJANGO_FRONTEND_BASE_URL` — **exactly** the public Next URL (no trailing slash), e.g. `https://your-app.vercel.app`. Activation emails and legacy redirects use this; it must not point at Heroku unless Next is served from the same host.
- Attach **Heroku Postgres** and point `DATABASE_URL` (or your `local_settings`) at it; run `heroku run python manage.py migrate`.

**On the Next host, set:**

- `NEXT_PUBLIC_API_URL` — `https://your-api.herokuapp.com` (or your custom API domain), no trailing slash.

Users always open the **Next** URL in the browser; the app calls the **Heroku** API over HTTPS. No single Heroku dyno is required to run both stacks unless you add a custom build (e.g. Docker or multiple buildpacks).

## License

MIT — see [LICENSE](LICENSE).
