# PROJECT_STATE — Choose Life Receipt & Project Tool

> Single source of truth for this project. Lives in the app's REPO and is
> maintained by the Code Agent on the Director's instruction (never auto-edited
> every task). The Director reads it at session start; a handoff is just
> "relay PROJECT_STATE.md and confirm." Keep it current; keep it honest.
>
> HOT vs COLD: THIS file is HOT — current truth + active constraints (infra §6,
> precedents §8, standing decisions §9, hazards §12, role model) + in-flight §4
> + the latest session note §5b. A swap Director reads only this. Detailed
> shipped-PR history and retired session notes live COLD in PROJECT_LOG.md
> (created only once §5 overflows), read only for provenance on a past PR.
> ACTIVE CONSTRAINTS NEVER MOVE TO COLD — precedents, standing decisions,
> hazards, and the role model are live rules, not history.
>
> Full shipped history (once it exists): PROJECT_LOG.md — not needed for a
> routine session start.
>
> Template version: v2.4
> Last updated: 2026-07-01 by Choose Life Director 1.0 — Bootstrap

-----

## 0. ACTIVE DIRECTOR SESSIONS

- (none currently active)

-----

## 1. IDENTITY
- **Project name:** Choose Life — Receipt & Project Tool
- **Mission:** A mobile-first web app for the Choose Life mission organization to manage expense receipts, tasks, and communication across Projects (e.g. Moldova, Kenya, Mexico, Germany, Poland) and the Groups within them. Members capture/submit receipts or file two-signature no-receipt notes from their phone; Treasurers and Admins review, approve/reject, export, and manage budgets, deadlines, and roles from a responsive console. Success = a bilingual (EN/RU) production app replacing ad hoc paper/spreadsheet tracking with auditable per-group budgets, OCR-assisted entry, real-time chat, and clean PDF/CSV export.
- **Operator:** <<pending — operator handle not yet given>>
- **Current Director:** Choose Life Director 1.0 — Bootstrap
- **Current Code Agent:** Cody Choose Life 1.0
- **Mode:** Pro (assumed — real backend, real OCR/FX, RLS-scoped roles; flag if Lite intended)

## 2. CHAT NAMING (authoritative)
- Director: `Choose Life Director 1.0 — Bootstrap`
- Code Agent: `Cody Choose Life 1.0 — Bootstrap`
- Code Agent's standing instructions location: <<not yet established — no repo exists. Will be either a CLAUDE.md at repo root or a section of this file; record the real answer once the repo is created, do not assume.>>

## 3. STACK
- Framework: Next.js (App Router) · TS strict · Tailwind · shadcn/ui · PWA-ready
- Backend: Supabase (Auth, Postgres, Storage, Realtime)
- Code-execution sandbox: n/a
- Hosting: Vercel · GitHub · pnpm
- AI / OCR: **SETTLED — Azure AI Document Intelligence, prebuilt Receipt model** (confirmed Russian printed+handwritten support; Textract disqualified — no Russian at all; Google Document AI inconsistent non-Latin quality + GCP lock-in). Abstracted behind the `lib/ocr` interface.
- CI: GitHub Actions (once repo exists)
- **Code Agent delivery:** operator relay — no direct GitHub/Cody MCP exists (confirmed: this session's Cody message itself arrived via operator relay).

## 4. IN-FLIGHT WORK
- **Repo creation** — not started; pending operator's autowire directions.
- **Supabase project** — not created. Supabase MCP is connected (org `twbszfyctshpcyyzizsp`); creating a project is a cost-incurring op — will run `get_cost` + present the confirmation before creating.
- **Vercel project** — not created; Vercel MCP connected, team binding pending.
- **OCR provider decision** — SETTLED: Azure AI Document Intelligence (see §3).
- **i18n seed files** — extracted from design_handoff STR dictionaries (197 EN/RU keys, verbatim, 2 trivial wording collisions resolved) — delivered by Director. **NOTE (Cody):** files did NOT arrive in the Code Agent environment via the relay — not on disk. Verbatim i18n seeding is blocked until they land in the repo.
- **Cody scaffold directive** — drafted, held pending: (a) Supabase project cost confirmation ($10/mo, org on Pro plan), (b) repo existence/ownership.
- **Logo assets received** — `CLeng.png` (cross-in-circle emblem) and `CLlogo1.png` (wordmark), both white/monochrome. Fine for the dark sidebar (`#29251d`) / capture screen (`#26211b`); will need a dark or full-color variant for the light canvas (`#faf7f1`) before launch — not blocking.

## 5. RECENT SHIPPED WORK
| # | Title | SHA | Date | One-liner |
|---|-------|-----|------|-----------|
| _(none yet)_ | | | | |

## 5b. LATEST SESSION NOTE
- 2026-07-01: Cold-start bootstrap. Received design handoff zip + two logo PNGs, read the full handoff (Member phone-first loop + responsive Treasurer/Admin console, "Ledger" visual direction locked with final design tokens, EN/RU i18n, fixed-demo FX rates to replace). Confirmed genuine greenfield — no canonical store existed. Audited MCPs: Supabase connected (org `twbszfyctshpcyyzizsp`, no project for this app yet), Vercel connected (team not yet bound). Drafted this file. Operator named the Director persona: **Choose Life Director 1.0**. Next: operator's autowire directions (repo + Code Agent delivery), OCR vendor decision, then scaffold repo + Supabase project (cost-gated) + Vercel project.

## 6. INFRASTRUCTURE STATE (Pro)
- Backend provider + project ref + plan: none yet
- Latest applied migration version: n/a
- Active edge function versions: n/a
- Storage buckets in use: n/a (will need buckets for receipt photos + signatures)
- GitHub repo + default branch: none yet
- Hosting (Vercel project + prod domain): none yet
- CI workflows + quality gates: none yet
- **Prod-ahead-of-repo drift:** none (nothing exists yet — reconciled by default)
- **MCP / tooling state:**
  - Supabase MCP — connected and audited (org `twbszfyctshpcyyzizsp`, 9 existing unrelated projects, none for Choose Life). Director can operate Postgres/migrations/edge functions/advisors directly once a project is created.
  - Vercel MCP — connected; team not yet identified/bound to this app.
  - GitHub — no Director MCP (standard). Repo access mechanism pending operator's autowire directions.

## 7. OPERATOR WORKING PREFERENCES
- Lead with the answer, no preamble.
- Mobile-screen-friendly length; operator works primarily from a phone.
- One question at a time; binary/trinary when asking.
- Output format: normal prose by default; a single fenced code block ONLY for a discrete copyable item (title line, state-store update, Code-Agent directive, a thing to paste) — one item per block, nothing else inside it.
- Direct tappable links (not descriptions) whenever sending the operator to an external dashboard/PR/deploy.
- Flag any step that genuinely requires a computer rather than improvising.

## 8. BANKED ARCHITECTURAL PRECEDENTS
- **Schema/migrations:** none yet.
- **Code/types:** none yet.
- **Deployment:** none yet.
- **Storage:** receipt photos + signatures will need dedicated Supabase Storage buckets with per-group RLS-equivalent access — design when schema is authored.
- **Process/discipline:** Design tokens (colors, type scale, radii, spacing) in the design handoff README are FINAL — implement directly, do not re-derive or reinterpret.
- **Project-specific:** Visual direction is locked to "Ledger" (exploration 1c in `Member Receipts (3 directions).dc.html`); the 1a/1b directions are reference-only, never implement them.

## 9. STANDING DECISIONS
- **Merge authority:** Code Agent opens PRs and stops; merges only on explicit per-PR Director clearance — never self-merges except docs-only (§11).
- **i18n:** EN/RU via a real i18n library (react-intl or i18next); the prototypes' inline `STR` dictionaries are the seed translation source. User-generated content (vendor names, comments, rejection reasons, no-receipt-note descriptions, people's names) is NEVER translated.
- **Primary Design Lens (Core Discipline 16):** production-correct, no ceiling/lock-in, right-sized for a moderately-complex bilingual finance/logistics app. Real OCR, real FX feed, real RLS-scoped per-group roles from day one — no throwaway shortcuts that fail at the role/deadline/export boundaries the brief calls out explicitly (submission cutoffs, duplicate detection, resubmission-resets-to-Pending).
- **Signatures:** must be real canvas-based touch/drawn capture in production — the cursive-text placeholder in the design files is not to be carried into the build.
- **OCR provider:** Azure AI Document Intelligence (Receipt model), abstracted behind `lib/ocr/index.ts` — never call the Azure SDK directly outside that module.
- **Cody dispatch protocol:** no direct MCP/GitHub path exists; Director produces single "Send this to Cody" blocks, operator relays both directions, until a more automated wiring is set up.

## 10. PRE-APPROVED BUNDLES
- `scaffold-app(name)` → repo init → stack scaffold → Supabase project → base schema → deploy skeleton → verify → report.
- `ship-feature(slug)` → branch → directive to Cody → CI → smoke verify → Director clears PR → Cody merges on clearance → report.
- `close-phase()` → run phase validation gate against written kill criteria → report pass/fail per criterion → no advance on any false.

## 11. AUTO-MERGE SCOPE
- Self-merge eligible ONLY when CI is green AND the PR is docs-only (every changed file is `.md` or comment-only — zero executable/type/config/SQL/edge-function changes).
- Everything else always holds for explicit per-PR Director clearance, regardless of green CI. Excluded from self-merge: migrations, RLS/auth/billing, customer-facing UI, agent-relay code, config, anything values-laden, PRs >500 lines, anything that fired a `get_advisors` WARN/ERROR.
- Default if unsure: HOLD for clearance.

## 12. HISTORICAL HAZARDS
- _(none yet)_

## 13. SWAP LOG
| Date | From → To | Reason |
|------|-----------|--------|
| 2026-07-01 | (none) → Choose Life Director 1.0 | Project bootstrap — first Director |

## 14. REPO + CODE-AGENT DELIVERY
- How the repo was created: <<pending>>
- How the Code Agent connects: operator relay (see §3).
- Pipeline verification: <<not yet run>>
- Governance: location still pending — set once repo exists.
- **Verification note:** Director has no GitHub MCP; PR/CI status and merges relay through the Code Agent or the operator once wired.
