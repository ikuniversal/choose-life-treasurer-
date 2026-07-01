PROJECT_STATE — Choose Life Receipt & Project Tool

> Single source of truth for this project. Lives in the app's REPO. Maintained by
> the Code Agent (Cody) on the Director's instruction, OR committed directly by the
> operator when the relay can't carry the payload. A handoff is just: new Director
> reads THIS file and confirms.
>
> Template version: v2.7
> Last updated: 2026-07-01 by Choose Life Director 5.0 (active) — Slice 1 banked

═══════════════════════════════════════════════════════════
SWAP REASON: routine, operator-requested, immediate (operator asked for a handoff right after 4.0 cold-started, before any task was given). NOT mistake-driven, NOT stuck → CLEAN stance: inherit facts AND judgment verbatim. IMPORTANT: no work was performed during the 4.0 session — zero new PRs, zero new decisions, zero schema changes. Everything below this point is identical in substance to the v2.6 (3.0→4.0) bank; only this section and the identity/swap-log sections changed. Do not assume something was missed — nothing happened in between.
═══════════════════════════════════════════════════════════
WHERE THINGS STAND (all verified live via Supabase + Vercel MCP):
- Auth COMPLETE (PR #5/#7/#8). Core member loop COMPLETE (PR #10). Review loop COMPLETE
  (PR #12). Polish pass COMPLETE (PR #13): member→console link, dead Export button removed.
  Projects & Groups management — SLICE 1 COMPLETE (PR #14): list/create/edit for projects
  and groups, admin-only, on existing RLS. NO delete (see hazard below) — deferred slice.
  Roadmap #5 slice 1 (no-receipt notes: member file w/ dual canvas signatures + console
  review) COMPLETE (PR #18, 26a9e03).
- App live: https://choose-life-treasurer.vercel.app · prod = 26a9e03 (merge #18), READY.
- Test-data hygiene: the original "Ifogbb" rejected receipt was DELETED via MCP this
  session (verified 0 rows remaining). ⚠️ NEW test data was created during operator smoke
  test of PR #14: project "Belts" (id 53ffda50-…) → group "Camp" (id 5e759172-…,
  spending_limit 200.00). Left in place on operator instruction (not cleared without
  asking) — next Director: confirm with operator whether to keep or delete.
- ⚠️ 4 orphan files PENDING operator dashboard tap-delete: 2 in receipt-photos (Chisinau
  path, historical) + 2 in signatures (fade7a24-…/ path, from the #18 prod smoke test —
  note row already MCP-deleted, verified 0 rows). No storage-delete MCP tool exists.
- i18n 197-key EN/RU seed + logo PNGs — STILL BLOCKED on a desktop direct commit
  (relay/Cody-attach drop large text+binaries — §12). Source risk noted in §12.

IN-FLIGHT / HANDED FORWARD:
1. Projects/Groups DELETE — deliberately NOT built. All three tables (projects, groups
   plus dependents) sit under ON DELETE CASCADE (see §6, §8, §12). A delete slice needs
   either (a) app-level block-if-non-empty guards, or (b) a Director-authored migration
   flipping the FKs to RESTRICT. Either way this is a Director-gated decision, not a
   Cody default — do not let Cody add a delete button against current schema.
2. Test data cleanup — "Belts"/"Camp" (see above) and the 2 orphan storage files — both
   awaiting operator action/decision, not yet resolved.
3. Roadmap #5 remaining after slice 1: tasks, comments/chat (needs operator clarification:
   item-comments vs group chat, Realtime or not), currency converter. Slicing + order
   already Director-approved: tasks → comments → converter.
4. i18n real-seed + logo drop-in — blocked on desktop commit (source risk if operator
   no longer has the original prototype JSON — see §12).
5. Migrations source-lock-in — DECIDED, NOT EXECUTED. Director determined (per Primary
   Design Lens: production-correct, no lock-in) this is worth fixing: zero migrations are
   source-controlled (confirmed this session — no supabase/ dir, no .sql files anywhere in
   repo). Plan: Director pulls live schema/RLS/functions/triggers/storage-config via Supabase
   MCP introspection, assembles an accurate baseline SQL file (NOT reconstructed from memory
   — ground-truth only), hands exact SQL to Cody to commit under supabase/migrations/.
   Held for Director clearance per §11 (touches migrations, never auto-merge). NOT STARTED —
   no queries run, no file drafted, no PR opened. Next Director: this is a clean pickup, no
   partial state to reconcile.

-----

## 0. ACTIVE DIRECTOR SESSIONS
- Choose Life Director 4.0 — outgoing (routine, immediate handoff, no work performed). Choose Life Director 5.0 — incoming, cold-starting from this file.

## 1. IDENTITY
- **Project:** Choose Life — Receipt & Project Tool
- **Mission:** Mobile-first web app for the Choose Life mission org to manage expense
  receipts, tasks, and communication across Projects (Moldova, Kenya, Mexico, etc.)
  and the Groups within them. Members capture/submit receipts or file two-signature
  no-receipt notes from their phone; Treasurers/Admins review, approve/reject, export,
  and manage budgets/deadlines/roles from a responsive console. Success = bilingual
  (EN/RU) production app replacing paper/spreadsheet tracking with auditable per-group
  budgets, OCR-assisted entry, real-time chat, and PDF/CSV export.
- **Operator:** ikuniversal (ikuniversal@gmail.com)
- **Current Director:** Choose Life Director 5.0 — P2 (incoming; confirm/rename)
- **Current Code Agent:** Cody Choose Life 1.0
- **Mode:** Pro

## 2. CHAT NAMING (authoritative)
- Director: `Choose Life Director 5.0 — P2 (Onboarding UI & remaining features)`
- Code Agent: `Cody Choose Life 1.0`
- Cody opens PRs and stops; merges only on per-PR Director clearance (§9), except
  docs-only which self-merge (§11). Cody has DIRECT repo access; the Director does NOT
  (no GitHub MCP). NOTE: Cody has repeatedly addressed directives to "Director 2.0" even
  after the swap to 3.0 — harmless (stale header habit), but a live reminder that Cody's
  own state tracking lags; always verify against MCP, never trust Cody's framing.
  Cody has twice self-merged small docs deltas even when told to HOLD — harmless for
  docs-only, but verify state before assuming a HOLD held.

## 3. STACK
- Framework: Next.js 16 (App Router) · React 19 · TS strict · Tailwind v4 · shadcn/ui · PWA
  - ⚠️ Tailwind v4 config lives in `src/app/globals.css` via `@theme`, NOT tailwind.config.js
- Backend: Supabase (Auth, Postgres, Storage) — @supabase/supabase-js + @supabase/ssr
- Hosting: Vercel · GitHub · pnpm (packageManager pinned: pnpm@11.9.0)
- AI / OCR: Azure AI Document Intelligence (Receipt model) — chosen, NOT yet wired.
  Behind lib/ocr interface (stub returns mock / graceful "couldn't read → manual" fallback,
  confirmed working in the capture loop). Real Azure wiring is a future PR.
- CI: GitHub Actions — .github/workflows/ci.yml (install + lint + typecheck + build)
- **Code Agent delivery:** Cody has DIRECT repo access (reads/writes/opens PRs itself).
  Director→Cody DIRECTIVE delivery is OPERATOR RELAY — no direct bridge. Large text
  (~18KB+), 197-key JSON, and binaries do NOT survive relay OR Cody session-attach → use
  DIRECT REPO COMMIT for those (§12).

## 4. IN-FLIGHT WORK (keep live)
- No open feature PRs. Auth + capture + review + polish + Projects/Groups-slice-1 loops
  all shipped and live.
- Projects/Groups DELETE — not started, Director-gated (CASCADE hazard, §6/§8/§12).
- Test data pending resolution: "Belts"/"Camp" smoke-test rows (operator to decide keep/
  clear) + 2 orphan/linked storage files (operator dashboard tap-delete, link in §CURRENT
  STATUS above).
- i18n 197-key seed + logo PNGs — STILL BLOCKED, need desktop direct commit (source risk:
  see §12). App runs on placeholder next-intl keys; PWA manifest icons missing.
- Roadmap #5 remaining after slice 1: tasks, comments/chat (needs operator clarification:
  item-comments vs group chat, Realtime or not), currency converter. Slicing + order
  already Director-approved: tasks → comments → converter.
- Test data: no_receipt_notes test row deleted (verified 0 rows); 2 signature PNGs pending
  operator dashboard delete.

## 5. RECENT SHIPPED WORK
| # | Title | Merge SHA | Date | One-liner |
|---|-------|-----------|------|-----------|
| 1 | Scaffold | a323d0e | 2026-07-01 | Next 16/React 19/Tailwind v4/shadcn, (member)/(console) route groups, locked tokens, next-intl (placeholder), lib/ocr stub, PWA, CI |
| 2 | Docs | f080ece | 2026-07-01 | PROJECT_STATE (self-merged) |
| 3 | Docs | 46ddd29 | 2026-07-01 | PROJECT_STATE (self-merged) |
| 4 | Supabase wiring | 161144c | 2026-07-01 | Typed clients, database.types.ts from live schema, member ledger on real data, graceful pre-auth empty state |
| 5 | Real Auth | 79ef80c | 2026-07-01 | Sign-in + reset, middleware protection, role-gated (member)/(console), context switcher, /auth/confirm |
| 6 | Docs | dfa3eda | 2026-07-01 | PROJECT_STATE (self-merged) |
| 7 | Admin Invite-user / Users & Roles (B5) | 144b157 | 2026-07-01 | Server-only admin client, inviteUser + role mgmt, /console/users; SUPABASE_SECRET_KEY rename |
| 8 | Auth callback resilience | d0732d1 | 2026-07-01 | Handle ?code / ?token_hash&type / #hash link shapes; fixes invite acceptance, no template edit |
| 9 | Docs (auth phase close) | f391690 | 2026-07-01 | §4/§5/§5b/§6 (self-merged) |
| 10 | Member Capture → Verify → Save (roadmap #3) | 8da9afe | 2026-07-01 | /capture photo → RLS-scoped upload to receipt-photos/{group_id}, lib/ocr stub prefill w/ graceful manual fallback, verify form, usd_equivalent locked at submission (§8), inserts receipts pending; verified e2e on prod |
| 11 | Docs (record #10) | 071e343 | 2026-07-01 | §5 row + §5b (self-merged) |
| 12 | Treasurer Review Queue (roadmap #4) | 51bca7c3 | 2026-07-01 | /console/review, RLS-scoped pending list, signed-URL photos, approve/reject + required reason, bulk approve; RLS-respecting client only; verified e2e (reject→rejected+reason) on prod |
| 13 | Polish: member→console link + remove dead Export button | 0c13ed1 | 2026-07-01 | (member) home shows console entry link admin/treasurer-only (reused PR #5 canAccessConsole, no new auth path); removed non-functional console Export placeholder + unused import; UI-only; verified: independent Vercel READY check + 0 runtime errors + operator confirmed live render/route on prod |
| 14 | Projects & Groups management, slice 1 (roadmap #2) | 58f2b38 | 2026-07-01 | /console/projects admin-only (mirrors #7 gating); list/create/rename project; create/edit group (name, spending_limit≥0, submission_deadline), all via existing RLS (projects_admin_write/groups_admin_write, is_admin()); updated_at via existing groups_set_updated_at trigger (verified, not set manually); NO delete (FKs cascade — deferred, see §6/§8/§12); UI/server-actions only, no schema/migration/RLS/env/seed; verified e2e on prod (real create+edit round-trip confirmed via direct DB read: row present, correct values, trigger fired) |
| 18 | No-receipt notes: file + review (roadmap #5.1) | 26a9e03 | 2026-07-01 | /no-receipt member flow (desc, date, 2 signer names, 2 real canvas pads → PNG to signatures/{group_id}/, insert w/ status pending, trigger owns updated_at) + /console/review Notes section (signed-URL sigs, approve/reject+reason); UI/server-actions only, zero new RLS/migration (all pre-existing, Director-verified before dispatch); e2e verified on prod: operator device test + Director DB/storage cross-check (row+2 PNGs+trigger+RLS paths all correct) |

## 5b. LATEST SESSION NOTES
- 2026-07-01 (Director 5.0): cold-started from v2.7, verified handoff vs live (zero drift:
  schema, CASCADE FKs, migrations, buckets, advisors). NOTE: Vercel MCP absent this session
  (capability drift vs §6 toolkit) — verification-independence degraded to
  operator-spot-check + Director DB-side checks; worked, but next Director should confirm
  Vercel MCP presence at cold start. Scoped roadmap #5 → 4 slices (RLS pre-verified: ALL
  surfaces need zero new RLS/migrations; comments are append-only by policy — no
  update/delete). Shipped #18 (notes). Operator merged #18 pre-clearance/pre-CI-relay
  (known §12 pattern) — post-hoc Director verification passed on all points. Test note
  MCP-deleted post-verification (dependency-checked, 0 comments).
- 2026-07-01 (Director 1.0): empty repo → live app. Scaffold (#1), Supabase wiring (#4),
  real Auth (#5) + docs. Authored DB schema + RLS + 2 buckets via MCP. Created Vercel
  project; fixed prod 500 (env only in .env.local). Seeded admin + Moldova/2 groups +
  fx_rates. Handed off mid-invite on rotation.
- 2026-07-01 (Director 2.0): cold-started, verified live. Operator had merged #7 with the
  callback fix still missing → rolled forward, cleared #8 (invite acceptance fixed, e2e
  passed). Shipped #10 (capture loop) + #12 (review queue), each independently verified
  (Vercel build + live DB/RLS checks) and operator e2e'd. Proved treasurer RLS scoping via
  simulated JWTs (rolled-back txns). Produced authoritative PROJECT_STATE.md (relay can't
  carry it → desktop commit pending). Handed off on routine rotation at a clean milestone.
- 2026-07-01 (Director 3.0): cold-started, verified the 2.0 handoff file against live
  state (clean, no drift) before adopting it. Ran the polish pass: dispatched Cody for
  member→console link + dead Export removal (#13), independently cleared via Vercel
  cross-check (not Cody's self-report) — §9 verification-independence in action. Executed
  the test-receipt delete myself via MCP after operator clearance (populated-table gate),
  confirmed 0 rows post-delete. Scoped Projects/Groups (roadmap #2): read live schema +
  RLS BEFORE dispatching, discovered existing admin-write policies already covered
  create/edit (no RLS migration needed) — and separately discovered ALL relevant FKs are
  ON DELETE CASCADE, which changed the shipped scope to explicitly exclude delete
  (banked as a precedent + hazard, not just a scope note). Cleared #14 the same way
  (independent Vercel check, CI-gate respected — did not clear until Cody confirmed CI
  green). Verified the shipped feature with a real DB read proving the operator's live
  smoke-test write persisted correctly (project+group create, trigger fired). Banking
  state now at operator request, mid-session (not a swap).

## 6. INFRASTRUCTURE STATE (Pro)
- **Supabase:** project `choose-life-receipt-tool`, ref `avmygueukigqbqhftuic`, org
  `twbszfyctshpcyyzizsp` (Pro), region us-east-1, Postgres 17. Status ACTIVE_HEALTHY.
- **Migrations (in order):** core_schema_and_rls · harden_rls_helper_functions ·
  revoke_anon_execute_role_helpers · rls_initplan_optimization_and_missing_indexes ·
  create_storage_buckets. (Verified live, unchanged this session — no new migration
  needed for Projects/Groups slice 1.)
- **Schema:** profiles, projects, groups, user_roles (per-group role pairs; admin =
  org-wide, group_id null), receipts, no_receipt_notes, tasks, comments, fx_rates.
  Enums: app_role (admin/treasurer/member), item_status (pending/reviewed/approved/
  rejected), task_status, expense_category (7). Helper fns: is_admin(), is_treasurer_of(),
  is_member_of(). receipts cols incl. receipt_date, photo_path, additional_info (note),
  usd_equivalent (nullable but locked at submit), reject_reason, is_duplicate.
  ⚠️ NOTE for future UI: form 'date'→receipt_date, note→additional_info, storage→photo_path.
  - **projects cols:** id, name, created_at. Minimal — no description/status field yet.
  - **groups cols:** id, project_id, name, spending_limit (numeric, nullable),
    submission_deadline (date, nullable), created_at, updated_at. Has a
    `groups_set_updated_at` trigger (verified live) — app code must NOT set updated_at
    manually, let the trigger handle it.
- **⚠️ FK DELETE BEHAVIOR — CASCADE, not RESTRICT (verified live this session):**
  `projects → groups` = CASCADE. `groups → receipts`, `groups → no_receipt_notes`,
  `groups → tasks`, `groups → user_roles` = ALL CASCADE. Practical effect: deleting one
  project can silently wipe every receipt, task, note, and role assignment under every
  group in that project — the DB will not stop it. This is why PR #14 explicitly ships
  NO delete UI (see §8, §12). Any future delete feature is Director-gated: either build
  app-level "block if non-empty" guards, or author a migration flipping these FKs to
  RESTRICT — do not let Cody default to a delete button against current schema.
- **RLS:** verified this session for the core loops —
  · receipts: insert (member of group + self), select (admin OR treasurer_of OR owner),
    update owner-while-pending, update treasurer/admin (approve/reject).
  · storage receipt_photos: insert (member of path group), select (admin OR treasurer_of
    path group OR owner of the receipt). Treasurer scoping PROVEN via simulated JWT
    (treasurer sees only their group's pending; member sees none).
  · projects: `projects_admin_write` (ALL, is_admin()), `projects_select` (admin OR any
    user with a role in a group under that project). Verified live this session.
  · groups: `groups_admin_write` (ALL, is_admin()), `groups_select` (admin OR member of
    group), `groups_treasurer_update` (treasurer_of, update-only). Verified live this
    session — admin-write already fully covers create/edit, so Projects/Groups slice 1
    needed ZERO new RLS.
  · user_roles: `user_roles_admin_write` (ALL, is_admin()), `user_roles_select` (admin OR
    self OR treasurer_of the group). Verified live, unchanged.
  · security-advisor: 3 accepted-residual WARNs (role-fns RPC-callable by authenticated,
    self-uid only, no leak) + 1 WARN "Leaked Password Protection Disabled" (Auth toggle,
    deferred). perf-advisor clean bar 1 cosmetic deferred.
- **Storage buckets:** receipt-photos (private, 10MB, image/*), signatures (private, 2MB,
  png/jpg) — RLS-scoped by group-id path convention. No storage-delete MCP tool exists;
  file deletion is operator-dashboard-only (see §12).
- **Vercel:** project `choose-life-treasurer` (prj_4rb6YuuNcJr6xrDKjTpPIiswnh6m, team
  team_IHCTzTPcdY47mLkznoU0idjD / roof-clean-pros-projects). Prod:
  https://choose-life-treasurer.vercel.app. Latest prod = 58f2b38 (merge #14),
  dpl_8KJPrdzm4KLu43mNSwe7KjtyL4iu, READY, 0 runtime errors (confirmed, 1h window,
  this session).
- **Vercel env vars:** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  (Prod+Preview), SUPABASE_SECRET_KEY (Prod+Preview, Sensitive). Functionally confirmed
  (invite + admin ops work). Assumed the new sb_secret_ key per §8; not separately eyeballed.
- **Supabase Auth config (dashboard-only):** Site URL = prod vercel.app; Redirect URLs
  include prod + preview wildcards. Email templates NOT edited (handled in code, PR #8).
  Invite/reset pass redirectTo=request origin (preview links return to preview — confirmed).
- **GitHub:** ikuniversal/choose-life-treasurer- (private, default main). Repo id 1285695072.
- **Seeded / LIVE data (grew via invite testing + this session's smoke tests):**
  · admin ikuniversal@gmail.com (83bd77ed-…, admin/null).
  · members: igor@usaflatroof.com (cc065da9-…, member/Chisinau), igor@flatroofpros.com
    (2a2f3f3e-…, member/Balti), info@flatroofpros.com (193bd3a2-…, member/Balti). No
    treasurer account exists yet (real ones come via invite).
  · projects: Moldova (07956352-…) → groups Chisinau Outreach (fade7a24-…) + Balti Camp
    (44580cea-…). NEW this session (operator smoke test of #14): project "Belts"
    (53ffda50-…) → group "Camp" (5e759172-…, spending_limit 200.00, no deadline) — TEST
    DATA, awaiting operator decision to keep or clear (see §CURRENT STATUS).
    fx_rates USD/EUR/MDL/KES/MXN/PLN (demo; EUR→USD ≈ 1.08).
  · receipts: 0 (the "Ifogbb" test receipt was DELETED via MCP this session, confirmed
    0 rows remaining — operator-cleared, dependency-checked first: 0 comment FKs).
  · storage receipt-photos: 2 objects still present under the Chisinau path (1 was
    linked to the now-deleted Ifogbb receipt, 1 is an orphan from an abandoned capture
    retry) — DB row is gone but the physical files remain; PENDING operator dashboard
    tap-delete (no MCP storage-delete tool; raw SQL delete would strand files worse).
- **Prod-ahead-of-repo drift:** migrations authored via MCP directly; NOT necessarily
  mirrored as repo migration files — confirm and open a source-lock-in PR if not reconciled.
- **MCP / tooling:** Supabase MCP connected (DB/migrations/storage/advisors/logs/types —
  Director operates directly). Vercel MCP connected READ-ONLY (deployments, build logs,
  runtime errors — RELIABLE independent verification; NO env/redeploy writes, NO storage
  file delete). GitHub: no Director MCP (Cody is the hands; Vercel MCP is the cross-check).

## 7. OPERATOR WORKING PREFERENCES
- Lead with the answer, no preamble. Mobile phone; keep it short.
- One question at a time; binary/trinary; tap-select works.
- Output format: prose default; a single fenced code block ONLY for a discrete copyable
  item (title line, state update, Cody directive, a paste) — one item per block.
- Direct tappable links (not descriptions) to any PR/deploy/route/dashboard. Never make
  the operator ask for a link.
- Operator relays Cody replies as a single copyable box; often uploads screenshots.
- Flag any step that genuinely requires a computer.

## 8. BANKED ARCHITECTURAL PRECEDENTS
- **Design tokens are FINAL** — "Ledger" direction locked; implement verbatim.
- **Schema/RLS:** helper fns pin search_path AND explicitly `revoke execute … from anon`
  BY NAME. Wrap auth.uid()/auth.role() in policies as `(select auth.uid())`. usd_equivalent
  computed + stored at submission (locked historical value). Duplicate detection deferred.
- **Storage:** receipt photos + signatures in private buckets, RLS-scoped by group-id path.
- **Secrets:** new sb_secret_ key (env SUPABASE_SECRET_KEY), never legacy service_role JWT.
  Confine the secret admin client to auth.admin.* ONLY; all regular table/storage access on
  RLS-respecting clients.
- **Private media to reviewers:** surface receipt photos via SHORT-LIVED SIGNED URLs created
  from the RLS-respecting client (treasurer/admin have storage SELECT) — never the secret
  client. (Established PR #12.)
- **Review actions:** approve/reject via RLS-respecting client (RLS enforces scope). Reject
  REQUIRES a non-empty reason (auditability). reject_reason is treasurer-authored UGC.
- **Auth email links:** handle all default Supabase shapes in code (?code / ?token_hash&type
  / #hash); invite/reset pass redirectTo=origin. No dashboard template edit.
- **i18n:** EN/RU via next-intl; seed from prototype STR dicts. USER-GENERATED content
  (vendor, comments, reject reasons, note text, names, project/group names) is NEVER
  translated.
- **Signatures:** real canvas touch capture in production (not the cursive-text placeholder).
- **Reuse role-gating, don't reinvent:** console-only routes (users, review, projects) all
  mirror the SAME admin/treasurer gating pattern established in PR #5/#7. New console pages
  reuse it; they don't grow their own auth check. (Established through #7, #12, #14.)
- **Check RLS before dispatching, not after:** for admin-CRUD console features, verify live
  policies via MCP FIRST — if existing admin-write policies already cover the need (as with
  projects/groups), ship UI-only with zero new migration. Only author new RLS when a gap is
  actually found. (Established PR #14.)
- **CASCADE-delete tables get NO delete UI until guarded:** projects/groups (and by
  extension any table with ON DELETE CASCADE toward user-data-bearing children) do not get
  a delete feature shipped until either app-level non-empty guards exist or the FK is
  changed to RESTRICT via a Director-authored migration. Never let a delete button ship
  against schema that cascades silently into receipts/tasks/notes/roles. (Established PR
  #14 — see §6, §12.)

## 9. STANDING DECISIONS
- **Merge authority:** Cody opens PRs + stops; Director clears per-PR after verifying; Cody
  merges on clearance. Docs-only self-merge allowed (§11). Director has no GitHub MCP.
- **Verification independence:** a Code Agent's report on its OWN §11-EXCLUDED work is never
  sufficient — needs operator spot-check OR the Director's own independent check (Vercel
  deploy metadata / runtime errors / live page load / MCP DB+RLS smoke test). For
  NON-excluded PRs, a concluded CI result relayed by Cody suffices. Applied twice this
  session (#13, #14) — cleared only after independent Vercel cross-check confirmed scope,
  and #14 specifically held until Cody's own report confirmed CI had gone green (did not
  bypass the CI gate on Director verification alone).
- **OCR provider:** Azure AI Document Intelligence, behind lib/ocr.
- **Autowire/cron dispatch pipeline:** evaluated, DECLINED by operator. Don't re-propose
  without explicit revisit.
- **Cody dispatch:** operator relay; no direct bridge.
- **Delete features on CASCADE-FK tables:** never ship without an explicit Director
  decision on guard mechanism (see §8 precedent). Projects/Groups delete is currently
  UNBUILT and gated on this decision.

## 10. PRE-APPROVED BUNDLES
- `ship-feature(slug)` → branch → directive to Cody → CI → smoke/independent verify →
  Director clears PR → Cody merges → verify prod → report.
- `close-phase()` → run phase validation gate vs written kill criteria → report per
  criterion → no advance on any false.

## 11. AUTO-MERGE SCOPE
- Self-merge ONLY when CI green AND docs-only (every changed file .md/comment-only).
- Everything else HOLDS for explicit per-PR Director clearance regardless of green CI.
  Excluded: migrations, RLS/auth/billing, customer-facing UI, agent-relay code, config,
  values-laden changes, PRs >500 lines, anything that fired an advisor WARN/ERROR.
- Default if unsure: HOLD.

## 12. HISTORICAL HAZARDS
- **Relay + Cody session-attach drop large/binary payloads (historically):** ~18KB JSON
  vanished in relay before; Cody session ATTACHMENT (file upload) drops files AND large
  text every time — that mechanism is still considered broken. HOWEVER: v2.5 of this file
  (29,590 bytes, pasted as inline chat text, NOT an attachment) was written+committed by
  Cody itself via a normal PR (#15, commit 5d9787d) and verified byte-exact via wc/grep/tail
  — exceeding the ~18KB threshold. CORRECTION: this was NOT an operator desktop `git push`;
  it was Cody committing operator-relayed pasted text. Treat the size threshold as
  inconsistent/unproven, not resolved — prefer an actual desktop commit for large/binary
  payloads when available; pasted-text-via-Cody is a viable fallback, proven to work at
  least once at this size, not yet trusted as a rule.
- **Director can't verify GitHub directly:** api.github.com rate-limited (shared IP);
  private-repo pages 404. Vercel MCP (list_deployments / get_runtime_errors) is the
  RELIABLE independent check — SHAs, messages, build state, runtime errors all cross-check.
- **.env.local ≠ Vercel:** gitignored values don't reach Vercel; env vars are per-env and
  need a REDEPLOY. A "build succeeded" check does NOT catch a missing runtime env var — use
  get_runtime_errors.
- **Redeploy targeting:** to test a PR use its OWN preview deployment; redeploying prod
  doesn't refresh a preview and vice versa.
- **No MCP for Vercel env vars or Supabase Auth config:** operator/dashboard only.
- **No MCP for Supabase Storage file deletion:** deleting objects requires the Supabase
  Studio dashboard (Storage → bucket → file). A raw SQL delete against storage.objects
  would remove the DB row but strand the physical file — worse than leaving it. Always
  route storage cleanup to the operator's dashboard, not a SQL workaround.
- **Mobile-Safari + Supabase dashboard editors:** operator (phone) cannot reliably
  select/paste in Supabase code editors — prefer code-side/MCP fixes over dashboard typing.
- **Default Supabase auth emails:** use {{ .ConfirmationURL }} — solved in code (PR #8).
- **Cody crossed-wires / stale drafting:** Cody has (a) described already-resolved state,
  (b) self-merged docs it was told to HOLD, (c) proposed options premised on a PR still
  being open after the operator had merged it, (d) addressed directives to a prior
  Director version number after a swap had already happened. ALWAYS verify live state
  before acting; don't correct Cody's framing mid-flow, just verify and proceed.
- **Auth tokens single-use:** each test invite/reset burns its token → use a FRESH email
  (you+aliasN@gmail.com).
- **Operator acts on the repo directly:** has merged PRs out-of-band mid-flow. Verify
  main/prod via Vercel before assuming a PR's state.
- **Console reachability:** RESOLVED by PR #13 — (member) home now links into (console)
  for admin/treasurer. (Historical note: previously needed a typed URL.)
- **Capture needs group membership:** an org-wide admin (group_id null) sees "not assigned
  to a group" on /capture — by design (capture is a member action). Test capture as a
  group member; review as admin/treasurer.
- **CASCADE deletes on projects/groups:** ALL FKs from groups (→receipts, →no_receipt_notes,
  →tasks, →user_roles) and from projects (→groups) are ON DELETE CASCADE, verified live.
  A delete button here — if ever added carelessly — could silently destroy an entire
  project's receipts, tasks, and role assignments with no DB-level stop. See §6/§8/§9.
  This is why PR #14 shipped with explicitly NO delete UI.
- **Smoke-testing on live prod creates real rows:** operator's PR #14 smoke test created a
  real "Belts"/"Camp" project+group in production data, not a sandboxed test. No branch/
  staging DB is currently used for smoke tests — worth considering a Supabase branch
  (create_branch tool available) for future feature testing if this becomes noisy.

## 13. SWAP LOG
| Date | From → To | Reason |
|------|-----------|--------|
| 2026-07-01 | (none) → Choose Life Director 1.0 | Project bootstrap — first Director |
| 2026-07-01 | Choose Life Director 1.0 → 2.0 | Routine rotation / context saturation |
| 2026-07-01 | Choose Life Director 2.0 → 3.0 | Routine rotation at clean milestone (auth + both core loops shipped) |
| 2026-07-01 | Choose Life Director 3.0 → 4.0 | Routine, operator-requested handoff |
| 2026-07-01 | Choose Life Director 4.0 → 5.0 | Routine, operator-requested, immediate handoff — no work performed during 4.0 session |

## 14. REPO + CODE-AGENT DELIVERY
- Repo: github.com/ikuniversal/choose-life-treasurer- (private, operator-owned, main default).
- Cody: DIRECT repo access; single long-lived branch claude/chat-session-e4mevb (resynced
  to main after each merge). Directives via OPERATOR RELAY. Large/binary → DIRECT COMMIT.
- Cody standing-rules location (CLAUDE.md?) NOT verified — confirm if it matters.
- Director has NO GitHub MCP; Vercel MCP is the independent cross-check.

═══════════════════════════════════════════════════════════
FEATURE ROADMAP
═══════════════════════════════════════════════════════════
1. Users & Roles — invite flow. ✅ DONE (#7 + #8).
2. Projects & Groups management screen (console). ✅ SLICE 1 DONE (#14): list/create/edit.
   Delete deferred — Director-gated on CASCADE-FK guard decision (§6/§8/§9/§12).
3. Member Capture → Verify → Save. ✅ DONE (#10).
4. Treasurer review queue (approve/reject/bulk). ✅ DONE (#12). submit→review→approve closed.
5. ← IN PROGRESS: notes ✅ DONE (#18). Remaining: tasks, comments/chat (clarification
   pending), currency converter.
6. Cross-cutting: real duplicate detection, PDF/CSV export, deadline enforcement, real
   Azure OCR wiring, i18n real-seed + logo drop-in (once assets land), Projects/Groups
   guarded delete.

POLISH / CLEANUP — DONE THIS SESSION:
- ✅ Member Home → Console link (#13).
- ✅ Console dashboard "Export" button — confirmed dead placeholder, removed (#13).
- ✅ Test receipt "Ifogbb" — deleted via MCP, verified 0 rows.

CLEANUP STILL PENDING (operator action):
- 4 orphan storage files — dashboard tap-delete: 2 in receipt-photos (Chisinau path,
  historical) + 2 in signatures (fade7a24-…/ path, from the #18 prod smoke test; note row
  already MCP-deleted, verified 0 rows). No storage-delete MCP tool exists.
- "Belts"/"Camp" smoke-test project+group — keep or clear, operator's call (unchanged).
