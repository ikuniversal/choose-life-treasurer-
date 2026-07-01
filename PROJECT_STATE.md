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
- **Repo / Supabase project / Vercel project** — all created and live (see §6). Reconciled out of in-flight.
- **Supabase wiring → Cody directive DISPATCHED (this PR).** Wire `@supabase/supabase-js` + `@supabase/ssr` and real queries into the `(member)` ledger against `receipts` + `no_receipt_notes`, using generated `Database` types. Graceful empty state when no session (auth still stubbed). **Auth wiring (`lib/auth.ts`) is the PR after this one.**
- **OCR provider decision** — SETTLED: Azure AI Document Intelligence (see §3); SDK wiring is a later follow-up.
- **i18n seed + logos → NEW follow-up PR.** PR #1 is merged/closed, so the real `en.json`/`ru.json` (197 keys) and `CLeng.png`/`CLlogo1.png` land via a fresh follow-up PR, not an amendment to #1. Blocker unchanged: the text relay drops large payloads and binaries can't relay through text at all — still needs direct-to-Cody-environment delivery or a direct commit. Placeholder EN/RU keys + missing icons remain flagged in-repo (`public/icons/README.md`).

## 5. RECENT SHIPPED WORK
| # | Title | SHA | Date | One-liner |
|---|-------|-----|------|-----------|
| PR #1 | merge `a323d0e` | 2026-07-01 | Initial Next.js 16 / React 19 / Tailwind v4 / shadcn scaffold — (member)/(console) route groups, locked design tokens via `globals.css @theme`, next-intl wired (placeholder EN/RU keys), `lib/ocr/index.ts` interface stub, PWA manifest, CI workflow (install+lint+typecheck+build). Merged by operator directly on green CI. **Gating event:** the operator's own "merged on green" spot-check / sign-off — the Director never received a relayed concluded CI result before the merge. Cody's GitHub-MCP readback (run 28495894599, conclusion=success) is supporting detail only, not the gate. |

## 5b. LATEST SESSION NOTE
- 2026-07-01: Cold-start bootstrap. Received design handoff zip + two logo PNGs, read the full handoff (Member phone-first loop + responsive Treasurer/Admin console, "Ledger" visual direction locked with final design tokens, EN/RU i18n, fixed-demo FX rates to replace). Confirmed genuine greenfield — no canonical store existed. Audited MCPs: Supabase connected (org `twbszfyctshpcyyzizsp`, no project for this app yet), Vercel connected (team not yet bound). Drafted this file. Operator named the Director persona: **Choose Life Director 1.0**. Next: operator's autowire directions (repo + Code Agent delivery), OCR vendor decision, then scaffold repo + Supabase project (cost-gated) + Vercel project.

## 6. INFRASTRUCTURE STATE (Pro)
- Backend provider + project ref + plan: Supabase, project ref `avmygueukigqbqhftuic`.
- **Database schema live:** `projects` / `groups` / `user_roles` / `receipts` / `no_receipt_notes` / `tasks` / `comments` / `fx_rates`, full RLS (3-role model). Latest migrations: `core_schema_and_rls`, `harden_rls_helper_functions`, `revoke_anon_execute_role_helpers`, `rls_initplan_optimization_and_missing_indexes`, `create_storage_buckets`. `get_advisors`: security clean (1 accepted residual — role-check fns are self-referential; RPC exposure to `authenticated` isn't a leak); performance clean except 1 deferred cosmetic item (overlapping admin/scoped policies — non-urgent at this app's scale).
- Active edge function versions: n/a
- Storage buckets in use: `receipt-photos`, `signatures` (both private).
- GitHub repo + default branch: `ikuniversal/choose-life-treasurer-` (private), default `main` — now has real content (scaffold PR #1 merged at `a323d0e`, no longer empty).
- Hosting (Vercel project + prod domain): project `choose-life-treasurer` (`prj_4rb6YuuNcJr6xrDKjTpPIiswnh6m`, team `team_IHCTzTPcdY47mLkznoU0idjD` / roof-clean-pros-projects). Framework auto-detected: Next.js. First production deployment READY (`dpl_8TX783mjTyvwpQVgpW7ambacL9mv`). Domains: choose-life-treasurer.vercel.app + 2 auto-generated aliases. Verified live via `get_project`, not just reported.
- CI workflows + quality gates: `.github/workflows/ci.yml` — install + lint + typecheck + build on PR/push to `main` (green on PR #1).
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
- **Schema/migrations:**
  - RLS helper functions (`is_admin`/`is_treasurer_of`/`is_member_of`) must pin `search_path` AND explicitly `REVOKE EXECUTE` from `anon` **by name** — Supabase grants new public-schema functions EXECUTE directly to `anon`/`authenticated` by default, not just via inherited PUBLIC; revoking from PUBLIC alone does not remove anon's access.
  - Wrap `auth.uid()`/`auth.role()` calls in RLS policies as `(select auth.uid())` — evaluated once per query instead of once per row.
  - `usd_equivalent` is computed and stored at receipt submission time (locked historical value), not derived live on read — exchange rates fluctuate; approved receipts shouldn't silently revalue.
  - Duplicate detection (`is_duplicate` column exists) — actual detection logic (amount+date+vendor match within group) is deferred to its own follow-up pass, not bundled into foundational schema.
- **Code/types:** none yet.
- **Deployment:** none yet.
- **Storage:** receipt photos + signatures will need dedicated Supabase Storage buckets with per-group RLS-equivalent access — design when schema is authored.
- **Stack version:** landed on Next 16 / React 19 / Tailwind v4 at scaffold time — approved (current stable > artificially pinned older major, per Primary Design Lens). Tailwind v4 config lives in `src/app/globals.css` via `@theme`, NOT `tailwind.config.js` — don't look for a config file that isn't there.
- **Process/discipline:** Design tokens (colors, type scale, radii, spacing) in the design handoff README are FINAL — implement directly, do not re-derive or reinterpret.
- **Project-specific:** Visual direction is locked to "Ledger" (exploration 1c in `Member Receipts (3 directions).dc.html`); the 1a/1b directions are reference-only, never implement them.

## 9. STANDING DECISIONS
- **Merge authority:** Code Agent opens PRs and stops; merges only on explicit per-PR Director clearance — never self-merges except docs-only (§11).
- **i18n:** EN/RU via a real i18n library (react-intl or i18next); the prototypes' inline `STR` dictionaries are the seed translation source. User-generated content (vendor names, comments, rejection reasons, no-receipt-note descriptions, people's names) is NEVER translated.
- **Primary Design Lens (Core Discipline 16):** production-correct, no ceiling/lock-in, right-sized for a moderately-complex bilingual finance/logistics app. Real OCR, real FX feed, real RLS-scoped per-group roles from day one — no throwaway shortcuts that fail at the role/deadline/export boundaries the brief calls out explicitly (submission cutoffs, duplicate detection, resubmission-resets-to-Pending).
- **Signatures:** must be real canvas-based touch/drawn capture in production — the cursive-text placeholder in the design files is not to be carried into the build.
- **OCR provider:** Azure AI Document Intelligence (Receipt model), abstracted behind `lib/ocr/index.ts` — never call the Azure SDK directly outside that module.
- **Cody dispatch protocol:** no direct MCP/GitHub path exists; Director produces single "Send this to Cody" blocks, operator relays both directions, until a more automated wiring is set up.
- **Verification independence:** applies FULLY (operator spot-check OR Director's own confirmed check required; Code Agent self-report never sufficient alone) to any PR touching a §11-excluded category — migrations, RLS/auth/billing, customer-facing UI, agent-relay code, config with real behavioral effect (secrets/deploy/permissions), >500 lines, or an advisor WARN/ERROR. For PRs OUTSIDE those categories, a Code Agent's relay of an actual CONCLUDED CI result (not in-progress/queued) is accepted as sufficient — consistent with §11 already treating green CI as the bar for non-excluded PRs. PR #1 (pure scaffold, inert CI config) qualifies for the lighter bar.
- **Autowire/cron dispatch pipeline** (relay table + pg_net/pg_cron polling + GitHub repository_dispatch, per the 2026-07-01 kit): evaluated, **DECLINED by operator** — recurring Anthropic API cost per dispatch (Claude Code Action) plus an always-on unattended loop wasn't worth it. Do not re-propose without the operator explicitly revisiting it. State at declination: pg_net/pg_cron not installed, no relay table/functions, no `gh_read_token`/`gh_dispatch_token` in Vault — clean slate if ever reconsidered. Continuing with the existing operator-relay dispatch model.

## 10. PRE-APPROVED BUNDLES
- `scaffold-app(name)` → repo init → stack scaffold → Supabase project → base schema → deploy skeleton → verify → report.
- `ship-feature(slug)` → branch → directive to Cody → CI → smoke verify → Director clears PR → Cody merges on clearance → report.
- `close-phase()` → run phase validation gate against written kill criteria → report pass/fail per criterion → no advance on any false.

## 11. AUTO-MERGE SCOPE
- Self-merge eligible ONLY when CI is green AND the PR is docs-only (every changed file is `.md` or comment-only — zero executable/type/config/SQL/edge-function changes).
- Everything else always holds for explicit per-PR Director clearance, regardless of green CI. Excluded from self-merge: migrations, RLS/auth/billing, customer-facing UI, agent-relay code, config, anything values-laden, PRs >500 lines, anything that fired a `get_advisors` WARN/ERROR.
- Default if unsure: HOLD for clearance.

## 12. HISTORICAL HAZARDS
- **Director cannot independently verify GitHub.** No GitHub MCP; unauthenticated bash_tool calls to `api.github.com` are unreliable (shared-sandbox IP hits GitHub's public rate limit), and private-repo pages 404 regardless of auth. PR/CI verification currently depends on operator spot-check OR explicit acceptance of Cody's self-report — record which was used per shipped PR in §5 going forward.

## 13. SWAP LOG
| Date | From → To | Reason |
|------|-----------|--------|
| 2026-07-01 | (none) → Choose Life Director 1.0 | Project bootstrap — first Director |

## 14. REPO + CODE-AGENT DELIVERY
- **Repo confirmed:** github.com/ikuniversal/choose-life-treasurer- (private — operator-owned, Cody has direct write access). PR #1 open, scaffold complete per Cody's report — **NOT yet cleared.**
- How the Code Agent connects: operator relay (see §3).
- Pipeline verification: CI workflow present (lint + typecheck + build); status pending operator spot-check (see §12 hazard).
- Governance: location still pending — set once i18n/logo assets land and PR #1 clears.
- **Verification note:** Director has no GitHub MCP; PR/CI status and merges relay through the Code Agent or the operator once wired.
