# NexusIoT Platform — Requirements & Environment Specification

Stack: React 19 + Vite 7 + TanStack Router/Start + Tailwind 4 + Supabase

## Runtime

- Node.js >= 20.18 (or Bun >= 1.1)
- Package manager: bun (recommended) or npm

## Environment variables (.env)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Install & run

```bash
bun install
bun run dev          # http://localhost:5173 (port may vary)
bun run build
bun run preview
```

## Database

```bash
supabase db push     # apply migrations in supabase/migrations/
supabase start       # local stack (optional)
```

## Roles (user_roles table)

- user — storefront customer
- vendor — vendor dashboard (/vendor)
- admin — platform admin (/admin)
- super_admin — full control: users, payment methods, site settings

First registered user is auto-assigned super_admin (see migration trigger).
Run `supabase/migrations/20260528120000_super_admin_login.sql` if the DB was created earlier.

## Routes — Customer (Daraz-style storefront)

| Route | Description |
|-------|-------------|
| / | Home, featured deals, categories |
| /products | Catalog + filters |
| /products/:slug | Product detail |
| /checkout | 3-step checkout |
| /auth | Sign in / sign up |
| /account/orders | Order history |

See `docs/ARCHITECTURE.md` for vendor and admin routes.

## Security

- RLS enabled on all tables
- Never commit `.env` or service role keys
