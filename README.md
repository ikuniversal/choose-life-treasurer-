# Choose Life — Receipt & Project Tool

Mobile-first, bilingual (EN/RU) web app for the Choose Life mission
organization to manage expense receipts, tasks, and communication across
Projects and the Groups within them.

See [`PROJECT_STATE.md`](./PROJECT_STATE.md) for the authoritative project
state, decisions, and constraints.

## Stack

- **Next.js** (App Router) · **TypeScript** (strict) · **Tailwind CSS v4**
- **shadcn/ui** components · **next-intl** (EN/RU, cookie-based locale)
- **Supabase** (Auth, Postgres, Storage, Realtime) — _wiring is a follow-up PR_
- **Azure AI Document Intelligence** for OCR, behind `src/lib/ocr` — _wiring is
  a follow-up PR_
- Hosting: Vercel · pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the `(member)` phone-first
app is at `/`, the `(console)` Treasurer/Admin view is at `/console`.

## Structure

```
src/
  app/
    (member)/     phone-first member app  -> /
    (console)/    Treasurer/Admin console  -> /console
    layout.tsx    fonts + locale provider
    globals.css   locked "Ledger" design tokens (Tailwind v4 @theme)
  components/
    ui/           shadcn/ui primitives
    console/      console navigation
    locale-switcher.tsx
  i18n/           next-intl config, request handler, locale action
  messages/       en.json / ru.json  (UI chrome only — see note below)
  lib/
    auth.ts       role-gating STUB (real Supabase Auth is a follow-up)
    ocr/          Azure DI boundary + mock stub
    utils.ts      cn()
```

## i18n

UI chrome is translated via next-intl. **User-generated content** — vendor
names, comments, rejection reasons, no-receipt-note descriptions, and people's
names — is **never** translated.

> ⚠️ `src/messages/{en,ru}.json` currently hold **placeholder** keys. The
> approved 197-key verbatim seed from the design prototypes must replace them
> (drop-in, do not hand-translate).

## Design tokens

The "Ledger" visual direction is **locked and final**. All tokens live in
`src/app/globals.css` under `@theme`. Do not reinterpret them.
