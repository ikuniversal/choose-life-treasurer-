PROJECT_STATE — Choose Life Receipt & Project Tool

> Single source of truth for this project. Lives in the app's REPO. Maintained by
> the Code Agent (Cody) on the Director's instruction, OR committed directly by the
> operator when the relay can't carry the payload. A handoff is just: new Director
> reads THIS file and confirms.
>
> Template version: v2.8
> Last updated: 2026-07-09 by Cody (Code Agent, on Director 6.0 instruction) — BANK #62/#64/#65/#66 MERGED + Project Admin role + group expenses (dashboard-drill-in thread CLOSED). CORRECTS #63's stale "#62 OPEN/HOLD": #62 MERGED fc7ff44 (OCR speed + multi-attachment, delayed by the Vercel outage). #64 MERGED 90de69c (Project Admin role UI — new app_role 'project_admin', user_roles.project_id, is_project_admin_of() kept SEPARATE from is_admin(); scoped group CRUD + treasurer/member mgmt; role-branched /console/users 3 ways; project-scoped dashboard). #65 MERGED 105c67a (dashboard SummaryCards → tappable; export-link version). Migrations 17→22 — source-lock-in 22/22: #18 project_admin foundation · #19 is_project_admin_of helper · #20 group+role mgmt RLS · #21 role-scope constraint correction · #22 project_admin names + spend visibility (CLOSES the two #64 gaps Cody flagged — get_group_member_names widened + receipts/notes SELECT for project_admin). database.types.ts REGENERATED (project_admin enum + project_id + helper). #66 MERGED 1f9d6d5 (/console/groups/[id] browsable group-expenses list — FilterPillRow + StatusPill + LATE/DUP; new getGroupActivity; repoints SummaryCard export-link → /console/groups/{id}; the operator-preferred revise of #65) → the whole dashboard-drill-in thread is CLOSED. NO open PRs. prod = 1f9d6d5 (#66). Owed now ONLY: 4 orphan storage files + i18n seed/logos. Designated branch claude/chat-session-e4mevb resynced → 1f9d6d5.

═══════════════════════════════════════════════════════════
SWAP REASON: routine, operator-requested, at a clean boundary — roadmap #5 fully complete, zero open PRs, no stuck work. NOT mistake-driven, NOT stuck → CLEAN stance: inherit facts AND judgment verbatim. 5.0's session: cold-start zero-drift verification → shipped all four #5 slices (#18 notes, #20 tasks, #22 comments+chat, #24 converter) → authored 2 migrations (get_group_member_names RPC, group_messages chat; both simulated-JWT verified) → all banks current through this file.
═══════════════════════════════════════════════════════════
WHERE THINGS STAND (all verified live via Supabase + Vercel MCP):
- Auth COMPLETE (PR #5/#7/#8). Core member loop COMPLETE (PR #10). Review loop COMPLETE
  (PR #12). Polish pass COMPLETE (PR #13): member→console link, dead Export button removed.
  Projects & Groups management — SLICE 1 COMPLETE (PR #14): list/create/edit for projects
  and groups, admin-only, on existing RLS. NO delete (see hazard below) — deferred slice.
  Roadmap #5 slice 1 (no-receipt notes: member file w/ dual canvas signatures + console
  review) COMPLETE (PR #18, 26a9e03). Roadmap #5 slice 3 (tasks) COMPLETE (PR #20, a29516d).
  Slice 2 (item comments + group chat, refresh-to-see v1) COMPLETE (PR #22, 3bb1e27,
  operator-merged on green after Director clearance). Comments+chat UI shipped with
  data-layer-only verification — operator waived device pass; RLS/data proven HIGH via
  simulated-JWT tests; UI rendering unverified, first real use is the de facto UI check.
  Roadmap #5 slice 4 (currency converter) COMPLETE (PR #24, f154687) → ROADMAP #5 FULLY
  COMPLETE (all four slices #18/#20/#22/#24, all shipped 2026-07-01).
  Roadmap #5 COMPLETE (all four slices, all 2026-07-01): notes #18 (26a9e03) · tasks #20
  (a29516d) · comments+chat #22 (3bb1e27) · currency converter #24 (f154687).
- App live: https://choose-life-treasurer.vercel.app · prod = 1f9d6d5 (merge #66), READY.
  (Was 8d92f9f/#60 at last write; #62 OCR+attachments · #64 Project Admin role · #65 dashboard
  card links · #66 group-expenses page all merged since — reconciled this bank. NO open PRs.)
- ✅ Converter math spot-check CONFIRMED by operator (500 MDL → $28.50) — roadmap #5
  verification fully closed (client-side math, zero data layer).
- Test-data hygiene: the original "Ifogbb" rejected receipt was DELETED via MCP (verified
  0 rows). The "Belts"/"Camp" smoke-test project+group was DELETED by Director via MCP
  (children counted 0 first; post-delete 0 rows). Test data now clean.
- ⚠️ 4 orphan files PENDING operator dashboard tap-delete: 2 in receipt-photos (Chisinau
  path, historical) + 2 in signatures (fade7a24-…/ path, from the #18 prod smoke test —
  note row already MCP-deleted, verified 0 rows). No storage-delete MCP tool exists.
- i18n 197-key EN/RU seed + logo PNGs — STILL BLOCKED on a desktop direct commit
  (relay/Cody-attach drop large text+binaries — §12). Source risk noted in §12.

IN-FLIGHT / HANDED FORWARD:
1. 4 orphan storage files — operator dashboard tap-delete (2 receipt-photos/Chisinau +
   2 signatures/fade7a24-…). No storage-delete MCP tool exists.
2. Roadmap #6 (cross-cutting) — ALL buildable slices SHIPPED incl. OCR now: export CSV (#29) +
   PDF (#37) · real FX (#31) · deadline (#33) · guarded delete (#35) · duplicate detection (#39) ·
   Azure OCR wired (#42) + attachment support (#43). Only BLOCKED item remaining: i18n 197-key
   seed + logos (desktop commit). (OCR "blocked on keys" is RESOLVED — #42 shipped live.)
3. i18n 197-key seed + logos — still blocked on desktop commit (§12 source risk).
4. DESIGN REFRESH (operator-requested reskin to a reference mockup) — COMPLETE. 1/3 (#51,
   foundation + dashboard), 2/3 (#53, nav shell + dashboard fidelity), 3/3a (#55,
   review+export+ledger), 3/3b (#56, tasks) all SHIPPED. Per the design-fidelity addendum
   the SummaryCard now shows approved-only spend + a gold/terracotta progress bar (#53) —
   this SUPERSEDES the earlier "limit + counts only, no bar" call (§8 updated).
5. Migrations source-lock-in — CLOSED at 22/22 (#13/#14 via #54, #15 via #57, #16 via #60,
   #17 via #62, #18–#22 via #64). #49 dup-trigger gap RESOLVED by migration #14; the two #64
   project_admin data gaps (names + spend visibility) RESOLVED by migration #22.
6. Project Admin role SHIPPED (#64, 90de69c) — new app_role 'project_admin' + user_roles.project_id;
   is_project_admin_of() kept SEPARATE from is_admin(); scoped group CRUD + treasurer/member mgmt;
   role-branched /console/users 3 ways; project-scoped dashboard. Migrations #18–#22 live.

RESOLVED: Source-lock-in fully closed (22/22). Design refresh fully shipped (1/3→3/3).
#62 (OCR speed + multi-attachment, fc7ff44) + #64 (Project Admin role UI, 90de69c) + #65
(dashboard card links, export-link version, 105c67a) + #66 (browsable group-expenses list,
1f9d6d5) all MERGED, 0 runtime errors, banked here. #64's two data gaps (project_admin names +
spend visibility) CLOSED by Director's migration #22.
#50 auth-delete e2e CLOSED (operator deleted Dan + Dave, verified 0 rows in auth.users).
Designated branch synced → 1f9d6d5. NO open PRs — the dashboard-drill-in thread (#65 export-link
→ #66 browsable list) is CLOSED; SummaryCard now links into /console/groups/{id}.
TEST DATA CLEARED: live receipts / notes / attachments all 0 (operator-wiped, MCP-verified).

RESOLVED THIS SESSION (Director 6.0): converter spot-check CONFIRMED (500 MDL → $28.50 —
roadmap #5 verification fully closed) · "Belts"/"Camp" test data DELETED via MCP (children
counted 0 first; post-delete 0 rows) · PR #21 identified (docs bank, migrations-reconcile,
merged — not a loose end) · Vercel MCP RECONNECTED this session (verification-independence
restored; the 5.0 degradation no longer applies).

-----

## 0. ACTIVE DIRECTOR SESSIONS
- Choose Life Director 6.0 — active (cold-started from v2.8, zero drift; closed roadmap #5 verification, opened roadmap #6). Choose Life Director 5.0 — outgoing, handed off clean.

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
- **Current Director:** Choose Life Director 6.0 — P3 (incoming; confirm/rename)
- **Current Code Agent:** Cody Choose Life 1.0
- **Mode:** Pro

## 2. CHAT NAMING (authoritative)
- Director: `Choose Life Director 6.0 — P3 (Cross-cutting: export, OCR, i18n & hardening)`
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
- PDF: @react-pdf/renderer + dejavu-fonts-ttf (FIRST new deps since scaffold, Director-
  approved, #37). PDF export at /console/export/pdf. next.config carries serverExternalPackages
  (@react-pdf resolved at runtime, off webpack/wasm) + outputFileTracingIncludes (traces the
  Cyrillic .ttf into the pdf serverless function). NO puppeteer/chromium.
- CI: GitHub Actions — .github/workflows/ci.yml (install + lint + typecheck + build)
- **Code Agent delivery:** Cody has DIRECT repo access (reads/writes/opens PRs itself).
  Director→Cody DIRECTIVE delivery is OPERATOR RELAY — no direct bridge. Large text
  (~18KB+), 197-key JSON, and binaries do NOT survive relay OR Cody session-attach → use
  DIRECT REPO COMMIT for those (§12).

## 4. IN-FLIGHT WORK (keep live)
- Roadmap #5 COMPLETE (#18/#20/#22/#24), converter spot-check CONFIRMED. Roadmap #6: ALL
  buildable slices SHIPPED — export CSV #29 + PDF #37 · FX #31 · deadline #33 · guarded
  delete #35 · dup detection #39 · Azure OCR #42 · attachment support #43. Follow-ups #44
  (stuck-upload fix) · #45 (upload confirmation + ledger thumbnails) · #46 (guarded role
  removal). Soft/hard delete #49 · delete user #50 · design refresh 1/3 #51 · 2/3 #53 ·
  3/3a #55 · 3/3b #56 (reskin COMPLETE) · treasurer member removal #57 · admin any-group
  capture + per-user activity #60 · OCR speed + multi-attachment #62 · Project Admin role UI
  #64 · dashboard card links #65 · group-expenses page #66 (MERGED 1f9d6d5).
  Migrations source-lock-in CLOSED 22/22. prod = 1f9d6d5 (#66). NO open PRs.
  Auth + capture + review + polish + full reskin + Project Admin role + group drill-in all live.
- Projects/Groups DELETE — SHIPPED (#35): DB-level RESTRICT FKs + count-then-confirm UI on
  /console/projects. CASCADE-wipe hazard RETIRED (§6/§8/§9/§12).
- Test data: "Belts"/"Camp" smoke-test rows DELETED via MCP (0 rows). Remaining: 4 orphan
  storage files (2 receipt-photos/Chisinau + 2 signatures/fade7a24-…, operator dashboard
  tap-delete — see CURRENT STATUS above).
- i18n 197-key seed + logo PNGs — STILL BLOCKED, need desktop direct commit (source risk:
  see §12). App runs on placeholder next-intl keys; PWA manifest icons missing.

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
| 20 | Tasks: create/assign→done→approve (#5.3) | a29516d | 2026-07-01 | /tasks member list + mark-done; /console/tasks roster picker via NEW get_group_member_names RPC, create, approve; e2e on prod (3-leg device test + Director DB cross-check + simulated-JWT transition proof) |
| 22 | Item comments + group chat (#5.2) | 3bb1e27 | 2026-07-01 | Append-only comment threads on receipts/notes (console review + member ledger); per-group chat member /chat + /console/chat, latest-50 + load-older, manual refresh, NO Realtime; names via RPC; types refreshed; data/RLS layer verified via 5 simulated-JWT tests (thread round-trip, cross-group blind, admin chat insert, constraint negative); UI unverified (operator waived) |
| 24 | Currency converter (roadmap #5.4, FINAL) | f154687 | 2026-07-01 | Shared read-only widget (member home + console dashboard): USD cross-rate client-side math over fx_rates, swap, 'Rates as of' stamp; authed RLS SELECT, fetch once per view; ZERO writes; usd_equivalent untouched; operator math spot-check CONFIRMED (500 MDL → $28.50) |
| 29 | CSV export console (roadmap #6.1) | 4abfa4f | 2026-07-01 | /console/export filterable CSV of receipts+notes (group / date range / status / type) via RLS-respecting client ONLY (admin=all, treasurer=own; no secret client, zero writes); submitter names via get_group_member_names RPC ONLY; columns incl. usd_equivalent (stored, never recomputed); RFC-4180 quoting + CRLF + UTF-8 BOM (Excel), attachment filename export_{group|all}_{from}_{to}.csv; GET route handler re-checks console access (bypasses layout gate); restores the dead Export button removed in #13. Verified: CI green + independent Vercel preview + operator e2e (Excel open, comma+quote vendor quoting intact, amounts vs stored values correct) |
| 31 | Admin FX rate editor (roadmap #6.2) | f90ca5e | 2026-07-02 | /console/rates admin-ONLY (is_admin gate, mirrors #7; stricter than canAccessConsole) inline edit of rate_to_usd via RLS-respecting client (fx_rates_admin_write; no secret client); validation numeric/>0/max-6-dp; USD row LOCKED at 1.0 (cross-rate base); fx_rates has NO updated_at trigger → action sets updated_at=now() EXPLICITLY so converter 'Rates as of' advances; 30-day stale banner; nav Rates entry admin-only. Verified: CI green + independent Vercel preview + operator 4-leg e2e (MDL saved, USD locked, 0/negative rejected, 'Rates as of' advanced) + Director DB cross-check (MDL 0.057→0.056, updated_at→2026-07-02, USD untouched). Residual: treasurer-redirect leg untested (no treasurer account; mirrors proven #7 gating, write path policy-enforced) |
| 33 | Deadline enforcement UI (roadmap #6.3) | afd7b16 | 2026-07-02 | Surfaces tamper-proof is_late (DB BEFORE-INSERT trigger from group's submission_deadline; app never sets/sends it). types refreshed (receipts.is_late + no_receipt_notes.is_late). /capture + /no-receipt show "Deadline: {date}" + amber "passed → LATE" notice (submit still allowed; server UTC today prop → pure render); LATE badge on member ledger + /console/review (receipts+notes); /console/export CSV is_late column after status; new LateBadge + getMemberGroups(). Verified: CI green + independent Vercel preview + operator device check (passed notice renders) + data layer HIGH (trigger: spoof insert forced true, simulated-JWT member insert forced true, null-deadline false — all rolled back). WAIVED residual (operator, #22 precedent): LATE badge + CSV is_late RENDER not device-tested (presentational; flag beneath proven) |
| 35 | Guarded delete UI — projects & groups (roadmap #6.4) | 9c8f478 | 2026-07-02 | /console/projects (admin-only) per-group + per-project Delete with inline confirm, over the live RESTRICT FKs. getProjects() returns per-group child counts (receipts/notes/tasks); non-empty → Delete disabled + "Contains N receipts, M notes, K tasks — cannot delete" (project: "Contains N groups"); empty → confirm (group notes member assignments + chat history CASCADE also removed) → delete via RLS admin_write client. deleteGroup/deleteProject map Postgres 23503 (RESTRICT, incl. add-after-count race) → friendly "cannotDelete", never raw. Verified: CI green + independent Vercel preview + operator 3-leg e2e (non-empty group/project disabled+count, empty DelTest group confirm→deleted, DB persistence confirmed) + Director data-layer proof (delete of group holding receipt refused 23503; empty succeeds; rolled back) |
| 37 | PDF export (roadmap #6 export slice — PDF) | 3b63bc5 | 2026-07-02 | /console/export "Download PDF" beside CSV (same form/filters via formAction, same RLS data path incl. RPC-only names, same route-handler access re-check as #29). NEW DEPS (Director-approved, first since scaffold): @react-pdf/renderer + dejavu-fonts-ttf — full-Cyrillic TTF REGISTERED + EMBEDDED (data URI) so RU UGC renders (default PDF fonts = blanks). next.config: serverExternalPackages (@react-pdf off webpack/wasm) + outputFileTracingIncludes (bundles .ttf into pdf function). GET route streams application/pdf, report_{group|all}_{from}_{to}.pdf; formal layout (header/table/per-currency totals+USD total/page-footer); shared parseExportFilters+slugifyGroup extracted (CSV route refactored onto them). Verified: CI green + independent Vercel preview + Director sandbox replication (same deps, exact Cyrillic string, text-extraction round-trip PASS incl. «»/ё/em-dash — MEDIUM-HIGH) + Cody local font-embed pre-check. WAIVED residual (operator): deployed route PDF not device-opened — approach proven, exact deployed render is first-real-use |
| 39 | Duplicate-detection UI (roadmap #6) | 8d8278a | 2026-07-02 | POSSIBLE DUPLICATE badge (blue, distinct from amber LATE), advisory/no-block, on /console/review receipt cards + member ledger receipt rows where is_duplicate; /console/export CSV is_duplicate column (after is_late) + PDF status "· DUP" marker. Surfaces the tamper-proof receipts.is_duplicate flag (BEFORE-INSERT trigger; app never sets/sends it; column pre-existed → no types change). UI/types only, no deps/schema/RLS. Operator merged DIRECTLY out-of-band; Director post-hoc verified (0 runtime errors since merge; UI/types-only vs pre-existing column, nothing schema-side to cross-check) |
| 40 | Migrations source-lock-in (archival) | 6f3c329 | 2026-07-02 | supabase/migrations/ created with all 11 live migrations mirrored VERBATIM (archival only — NOT run/applied; live schema unchanged). Byte-audit vs Director manifest: every file = manifest + 1 (trailing newline manifest omits); 2 files further +2/+6 for UTF-8 multibyte glyphs (→, —) the manifest counted as single chars — complete, no truncation. Retires the source-lock-in backlog. Verified: CI green + independent Vercel preview + byte-deltas explained; on own branch claude/migrations-source-lock-in (two concurrent PRs can't share one head) |
| 42 | Azure OCR wired (roadmap #6 OCR item) | 36a7b05 | 2026-07-03 | Real Azure AI Document Intelligence prebuilt-receipt call behind the EXISTING lib/ocr boundary (Azure never imported elsewhere; server-only; raw REST + LRO poll; no new deps). Prefills vendor/date/amount/currency ONLY where per-field confidence ≥ 0.5; ANY failure (missing env, timeout/abort, non-2xx, "failed", malformed JSON) → null → the existing manual-entry fallback fires unchanged, NO new error state. Roadmap #6 OCR item UNBLOCKS — no longer "blocked on operator keys." |
| 43 | Attachment support — images + PDF + Word (roadmap #6) | 036f687 | 2026-07-03 | Capture accepts the 7 bucket mime types (was image/*); dropped capture="environment" so iOS shows its native picker (Camera/Library/Browse); client type + 10MB validation w/ PDF/Word-aware messages. lib/ocr SKIPS the Azure call for non-image mime (normal manual path, not a failure). /console/review renders images as a signed-URL thumbnail, PDF/Word as a labeled signed-URL download link (FileText icon + filename); review data carries photoIsImage + photoName. UI/server-actions only; bucket mime already widened via migration #12 (see §6). |
| 44 | Fix stuck "Uploading…" hang + dead /receipts nav | d6ffcdb (feat 0d35b97) | 2026-07-03 | ROOT CAUSE (regression surfaced w/ #42/#43): analyzeReceipt re-downloaded the just-uploaded object server-side via the RLS client to read its bytes — but a member has NO storage SELECT on their own photo until a receipts row links it (receipt_photos_select = admin OR treasurer OR owner-of-linked-receipt) → GET /object 400 → spinner hangs on every receipt. FIX: analyzeReceipt takes the in-memory File via FormData (no storage read-back); capture-form wraps OCR in try/catch so setPhase("verify") ALWAYS runs; next.config serverActions.bodySizeLimit "10mb" (1MB default rejected most photos). Also removed the dead "/receipts" member nav tab (404 since scaffold — ledger lives on Home "/"). UI/server-actions only. |
| 45 | Upload confirmation + member-ledger evidence + signed-URL error surfacing | 28ec25b (squash: 439c762 + af2cd5a) | 2026-07-03 | (a) Capture SUCCESS card: after save, a persistent confirmation (thumbnail via a client object URL, or doc icon + filename; "Submitted"; vendor/amount when OCR filled; timestamp) before returning — no silent redirect. (b) Member Home ledger rows now show a small evidence thumbnail (image) / doc icon (PDF/Word) via a signed URL from the RLS client — closes the #43 gap (no member-side evidence surface existed). (c) createSignedUrl errors were DISCARDED (const { data } = …) → silent no-thumbnail; now console.error'd at all 3 signing sites (member ledger, console review, note review); photoUrl still falls back to null. NOTE: the operator's "no thumbnails" report was a DEPLOY gap (#45 preview vs prod still on #44), NOT a code defect — RLS grants the owner the signed URL (live-simulated). No schema/RLS/env change, no new deps. ⚠️ Director directive under-described #45 as only the signed-URL surfacing (af2cd5a); it also carried the upload card + ledger thumbnails (439c762) — banked to full scope. |
| 46 | Remove role assignment, last-admin guarded (roadmap #2 polish) | b00252e (feat 841c282) | 2026-07-04 | /console/users per-chip X now deletes that specific user_roles row (id PK) via the EXISTING user_roles_admin_write (ALL already covers DELETE — no new RLS/migration). removeRole(roleId) returns a friendly {error} (was void); server-side LAST-ADMIN GUARD: reads the target role, and if role='admin' counts remaining admin rows and REFUSES when ≤ 1 ("Cannot remove the last remaining Administrator") — regardless of who removes whom, incl. self. Count-then-confirm UX (inline ✓/✕, inline error, no chip removed) mirrors #35; chips extracted to a client component. i18n EN+RU. UI/server-action only. Verified: CI green (verify run #98) + independent Vercel preview. |
| 48 | Source-lock-in: mirror migration #12 (archival) | e989d8c (feat 2e89ba8) | 2026-07-04 | supabase/migrations/20260703070915_widen_receipt_photos_bucket_mime_types.sql — verbatim archival mirror of the live mime-widen (image/* → the 7 attachment types), byte-faithful vs the live bucket state (verified via MCP). NOT run/applied. Bumped source-lock-in 11/12 → 12/12. Held for Director clearance (contains .sql, §11) then merged. |
| 49 | Soft/hard delete — receipts + no-receipt notes | 2ba70a8 (feat da3ce70) | 2026-07-04 | Live migration #13 (add_receipt_note_soft_delete, 20260704204035) added deleted_at + admin-only DELETE policies on both tables (verified live). UI/server-actions only: /console/review "Delete" on receipt AND note cards — treasurer → SOFT (UPDATE deleted_at) via *_update_treasurer_admin; admin → HARD (DELETE) via *_delete_admin (confirm warns irreversible). Member soft-deletes own PENDING via owner-pending policy. `deleted_at is null` filter added to EVERY active read (review queue, note queue, member ledger receipts+notes, CSV+PDF export). types: deleted_at on both tables. i18n EN+RU, no deps. ⚠️ KNOWN GAP: dup-detection trigger set_is_duplicate still counts soft-deleted rows (a 1-line migration `and r.deleted_at is null` needed — OUT of this UI-only PR's scope; flagged, awaiting Director go). |
| 50 | Delete user (admin-only) | 427e9c2 (feat 50d8374) | 2026-07-04 | Admin-only deleteUser via the secret client confined to auth.admin.deleteUser ONLY (§8). LAST-ADMIN guard reuses #46 (count≤1). AUTHORED-CONTENT guard counts receipts/notes/tasks(assignee OR created_by)/comments/messages — all NO ACTION FKs (verified live) → any >0 blocks with friendly counts; profiles+user_roles CASCADE so a content-free user (even one holding roles) deletes cleanly. "Delete user" on every user row, inline confirm. Merged operator-side pre-report (§12 pattern). Data-layer facts (2 admins, NO ACTION FKs) Director-confirmed independently; the auth.admin.deleteUser call is NOT self-testable (irreversible, no txn rollback) — first real e2e now CLOSED: operator deleted Dan + Dave via the live app, verified 0 rows in auth.users. |
| 51 | Design refresh 1/3 — foundation + dashboard | ebcf66f (feat 1fe5e76) | 2026-07-04 | Reskin to a reference mockup; SUPERSEDES §8 "Design tokens FINAL" (operator-requested visual match). Scope = reskin-only (colors/type/cards/spacing), NO route/nav restructure, NO manual role-switcher (real role-gating stays, just styled). New tokens: --radius-card-lg, --shadow-card, .num (mono+tabular-nums — the STANDARD for all numeric/currency/date/email values, supersedes per-instance font-mono). Restyled StatusPill + TaskStatusBadge (solid fill + white text). New shared: StatCard, RoleBadge (indicator only, not a switcher). Applied: /console dashboard StatCard grid + console-shell RoleBadge. 0 runtime errors post-merge (1h window). 2/3 (review+export+ledger) + 3/3 (tasks) AUTHORIZED, same constraints (FilterPillRow + StatusPill, approve/reject/done logic untouched). |
| 52 | Docs bank #48–#51 + reskin precedents | 53d3fda | 2026-07-04 | PROJECT_STATE bank (docs-only, self-merge §11). NOTE — two facts in this bank were later corrected by #53/#54: (a) it said the SummaryCard would stay "limit + child counts only, no progress bar"; that precedent was SUPERSEDED (see #53); (b) migration count stated as 12/13, since advanced. |
| 53 | Design refresh 2/3 — nav shell + dashboard fidelity | 9273b60 (feat 0fcfa29) | 2026-07-05 | Presentation nav shell (dark sidebar/strip → light top-header wordmark + RoleBadge + locale + sign-out; ConsoleNav = single horizontal pill row of the EXISTING per-role links; routes/link-set/gating UNCHANGED). Dashboard data fidelity: new getDashboard() read model on the RLS client (viewer scope already correct). Per-group spend = sum(usd_equivalent) of APPROVED, non-deleted receipts — the v1 spend definition (flips to include pending only on operator word). Org StatCards (Submitted / Awaiting review / Groups over budget / Active projects) + per-group SummaryCard with gold/terracotta progress bar. SUPERSEDES the #51/#52 "limit + counts only, no bar" precedent. No schema/RLS/route change; no new deps. |
| 54 | Source-lock-in: mirror migrations #13 + #14 | 988d343 (feat 9ea8d7d) | 2026-07-05 | Verbatim archival mirror of two already-live migrations into supabase/migrations/ — 20260704204035_add_receipt_note_soft_delete (#13) + 20260704210822_exclude_soft_deleted_from_duplicate_check (#14, Director-authored: set_is_duplicate now excludes deleted_at IS NOT NULL). NOT re-applied. Source-lock-in 12 → 14. Held then merged. |
| 55 | Design refresh 3/3a — review, export & member ledger | a507f2e (feat 948ea64) | 2026-07-05 | New shared FilterPillRow primitive (client, controlled — nav pill language). Member ledger → client LedgerList + status filter (All + present statuses, counts); row markup/evidence/pending-soft-delete/comment-threads carried verbatim. Review + export cards → rounded-card-lg + shadow-card; headings → text-2xl. Export stays no-JS GET form (shell only). i18n member.all. No data/action/route/gating/schema/RLS change; approve/reject/bulk/checkbox untouched. |
| 56 | Design refresh 3/3b — tasks | 402b5f4 (feat 45681a4) | 2026-07-05 | Status filter pills (All/Assigned/Done/Approved + counts) over member + console task lists; cards → rounded-card-lg + shadow-card; headings → text-2xl. Pills were INLINED (kept branch independent of #55 for per-PR clearance); DRYed onto FilterPillRow in #58. i18n tasks.all. No data/action/route/gating/schema/RLS change; create/mark-done/approve untouched. → Design refresh 1/3→2/3→3/3 COMPLETE. |
| 57 | Treasurer member removal on /console/users (+ mirror #15) | 3b86e4c | 2026-07-05 | Live migration #15 (treasurer_remove_member_from_own_group, 20260705061526) — additive scoped DELETE policy (role='member' AND is_treasurer_of(group_id)); admin's user_roles_admin_write untouched. UI+action only: /console/users gate widened admin-only → canAccessConsole; ADMIN view unchanged (invite/list/delete/chips); TREASURER view = their group roster(s), names via get_group_member_names RPC (no admin client, no emails), "Remove from group" on MEMBER rows only. removeMember(userId, groupId) DELETEs member role row on the RLS client (0 rows → friendly "cannotRemove"), caller re-checked as treasurer of group, #46 inline confirm, i18n EN/RU. Also mirrors migration #15 verbatim. MERGED, 0 runtime errors. |
| 58 | chore: DRY tasks filter pills → FilterPillRow | b9daede (feat 502579b) | 2026-07-05 | Pure refactor: both task lists now use the shared FilterPillRow (from #55) instead of #56's inlined copies; identical markup/behavior, drops local cn-pill blocks + unused cn imports. MERGED, 0 runtime errors. |
| 59 | Docs bank #52–#58 + #52 corrections | a92dd4b | 2026-07-05 | PROJECT_STATE bank (docs-only, self-merge §11): §5 rows #52–#58, SummaryCard precedent SUPERSEDED, source-lock-in + prod SHA + owed list refreshed. |
| 60 | Admin any-group capture + per-user activity (+ mirror #16) | 8d92f9f (feat 35a3b7d) | 2026-07-05 | Live migration #16 (admin_insert_receipts_any_group, 20260705133257) — additive admin INSERT policies on receipts (submitted_by=self AND is_admin()) + receipt-photos storage; member policies untouched. UI/server-action only. /capture: admins get a required dropdown of ALL groups ("Project · Group", getAllGroupsForCapture on the RLS client), upload to receipt-photos/{chosen group_id}, insert group_id=chosen (saveReceipt keeps submitted_by=self; is_late/is_duplicate stay trigger-owned); members unchanged. /console/users/[id]: admin-only per-user activity — receipts+notes newest-first, deleted_at is null, on the RLS client; email via a single auth.admin.getUserById (sanctioned §8); StatusPill + LATE/DUP + .num; link added to admin user rows only. Mirrors migration #16 → source-lock-in 16/16. i18n EN/RU. Built pre-#57; auto-merged onto #57's role-branched /console/users — AUDITED CLEAN (role branch intact, link only in admin branch, no dup markup, tsc+build green). MERGED, 0 runtime errors. |

| 61 | Docs bank #57/#58/#60 merged + post-merge audit | 159af0d | 2026-07-05 | PROJECT_STATE bank (docs-only, self-merge §11): #57/#58/#60 merge SHAs; #57↔#60 /console/users auto-merge AUDITED CLEAN; #50 e2e CLOSED; migration #16 + source-lock-in 16/16; §8 precedents (admin capture, per-user activity). |
| 62 | OCR speed pass + multi-attachment capture (+ mirror #17) | fc7ff44 | 2026-07-06 | Live migration #17 (add_receipt_attachments_table, 20260705225506 — receipt_attachments child table, RLS mirrors parent receipt). UI/server-action only; types REGENERATED. (A) OCR speed: client-side downscale for the OCR call ONLY (~1600px/JPEG 0.75, stored original untouched, ~10× smaller payload); storage upload(s) + OCR run in parallel (Promise.all); Azure poll tightened (first ~600ms, backoff→2s, same budget + fail-closed). (B) Multi-attachment: capture input multi-select (#43 mime set); first image = PRIMARY (photo_path + OCR), remaining ≤5 (10MB each) → receipt-photos/{group_id}/ + one receipt_attachments row each after the receipt insert (best-effort, is_late/is_duplicate stay trigger-owned); shared getReceiptAttachments (batched select + signed URLs) + hook-free AttachmentLinks; count + signed-URL links shown in review queue, member ledger, /console/users/[id] activity. Mirrors migration #17 → source-lock-in 17/17. i18n EN/RU. MERGED (delayed by the Vercel outage; CORRECTS #63's stale "#62 OPEN/HOLD"). |
| 63 | Docs bank #17 + #62 + receipts-cleared | 71a159b | 2026-07-06 | PROJECT_STATE bank (docs-only, self-merge §11): migration #17 + source-lock-in 17/17, #62 row (recorded OPEN at write — later corrected to MERGED fc7ff44 by this bank), TEST DATA CLEARED note (live receipts/notes/attachments all 0). |
| 64 | Project Admin role — UI (+ mirror #18–#22) | 90de69c | 2026-07-09 | Live migrations #18–#22 (project_admin foundation + is_project_admin_of helper + group/role mgmt RLS + role-scope constraint correction + names/spend visibility). New app_role 'project_admin' + user_roles.project_id; is_project_admin_of() kept SEPARATE from is_admin() (never widened). 1) /console/users invite gains Project Admin option → Project picker replaces Group picker, sets project_id + group_id null. 2) THREE-branch /console/users: admin (unchanged) · project_admin (their project's groups + rosters — scoped group CRUD via paCreateGroup/paUpdateGroup/paDeleteGroup over guarded-delete, treasurer/member mgmt via paAssignRole/paRemoveRole, NO invite-new-user; RLS is the real gate, caller re-checked, .select() detects 0-row scope failures) · treasurer (unchanged). 3) Project-scoped dashboard (their project's SummaryCards, no org StatCards). auth.ts: RoleAssignment gains projectId/projectName, CONSOLE_ROLES incl. project_admin, isOrgAdmin/projectAdminProjects helpers. Console plumbing: nav Users link shown to admin OR project_admin (projects/rates stay admin-only). Mirrors #18–#22 → source-lock-in 22/22. types REGENERATED. i18n EN/RU. FLAGGED two data gaps at PR (get_group_member_names + receipts/notes SELECT excluded project_admin → names uuid-fallback + counts read 0) — Director CLOSED both via migration #22. MERGED. |
| 65 | Dashboard group cards → tappable (export-link) | 105c67a (feat d478769) | 2026-07-09 | SummaryCard wrapped in a Link into an existing filtered expense view — Director's read = the /console/export surface with the group pre-selected via URL param (?group=<id>); export page gains a searchParams param that pre-selects the group filter (unknown/out-of-scope id → "all"). Visible affordance: ChevronRight + hover lift/shadow + focus ring + aria-label. Applies to admin/treasurer/project_admin dashboards. No new route/query/RLS. i18n dashboard.viewGroupExpenses. Cody flagged that /console/export is a download FORM (no on-page list) and /console/review is pending-only → operator preferred a purpose-built browsable list → revise #66. MERGED. |
| 66 | /console/groups/[id] browsable group expenses (revise of #65) | 1f9d6d5 | 2026-07-09 | NEW on-page browsable expenses list at /console/groups/[id]: server page getGroupActivity(id) (notFound() if null), back link to /console, header (project · group), client GroupActivityList unifying receipts + notes into rows — FilterPillRow (All + statuses present) + StatusPill + LATE/DUP + .num + AttachmentLinks (reuses #60's activity rendering keyed on group_id; new getGroupActivity read; groupExpenses i18n namespace). Repoints the #65 SummaryCard href from /console/export?group= → /console/groups/{group.id}, keeping the chevron/hover affordance. Export page stays the download surface, unchanged. Migration #22's SELECT policies (receipts_select_project_admin + notes_select_project_admin) + groups_select (is_admin OR is_member_of, covers treasurers) → all three roles see real data. No schema/RLS change. i18n EN/RU. CI verify green → MERGED (operator/clearance). Closes the dashboard-drill-in thread. |

## 5b. LATEST SESSION NOTES
- 2026-07-04 (Director 6.0, CATCH-UP BANK): live/Vercel audit found prod had moved
  6f3c329(#40) → b00252e(#46) via FIVE unbanked merges (#42–#46) since the last write —
  none recorded. Reconstructed §5 rows #42–#46, §6 migration #12 + user_roles DELETE,
  roadmap #6 (OCR now DONE), and a NEW source-lock-in pending item (migration #12 not yet
  mirrored). Also this session: diagnosed the "no ledger thumbnails" report as a DEPLOY gap
  (prod was still #44; #45 unmerged) not a code defect — cleared + merged #45 (28ec25b);
  Vercel had DROPPED the #45 merge webhook (prod stuck on #44) → re-triggered via empty
  commit bb5a04d, prod built. Then shipped #46 (guarded role removal). SHA reconciliation
  vs the directive: #44 merge = d6ffcdb (feat 0d35b97), #45 merge = 28ec25b (squash of
  439c762 + af2cd5a), #46 merge = b00252e (feat 841c282) — merge SHAs banked as primary.
  Flag: the directive under-described #45 (also carried the upload card + ledger thumbnails,
  not just signed-URL surfacing) — banked to full scope.
- 2026-07-02 (Director 6.0): cold-started from v2.8, zero drift vs live; prod verified
  4a2c4cd at start. Closed roadmap #5 verification (converter spot-check CONFIRMED),
  deleted Belts/Camp test data via MCP (0 rows), resolved handoff loose ends (PR #21 = docs
  bank; Vercel MCP reconnected). Opened roadmap #6 and dispatched slice 1 (CSV export).
  Cleared + merged #29 (CSV export, 4abfa4f): CI green + independent Vercel preview check
  (675601b, scope confirmed) + operator e2e on preview. e2e used a Director-authored
  SYNTHETIC receipt (comma+quote vendor, to prove RFC-4180 quoting) on the PR preview;
  amounts/usd_equivalent verified vs stored values; synthetic row MCP-deleted post-test,
  receipts back to 0, zero residue.
- 2026-07-01 (Director 5.0): cold-started from v2.7, verified handoff vs live (zero drift:
  schema, CASCADE FKs, migrations, buckets, advisors). NOTE: Vercel MCP absent this session
  (capability drift vs §6 toolkit) — verification-independence degraded to
  operator-spot-check + Director DB-side checks; worked, but next Director should confirm
  Vercel MCP presence at cold start. Scoped roadmap #5 → 4 slices (RLS pre-verified: ALL
  surfaces need zero new RLS/migrations; comments are append-only by policy — no
  update/delete). Shipped #18 (notes). Operator merged #18 pre-clearance/pre-CI-relay
  (known §12 pattern) — post-hoc Director verification passed on all points. Test note
  MCP-deleted post-verification (dependency-checked, 0 comments). Shipped #20 + #22.
  Authored get_group_member_names + group_messages migrations (both simulated-JWT verified).
  #20 device test debugged via auth sign-in log (pre-merge 404, wrong-account). #22 verified
  internally at operator instruction — all 5 RLS tests pass, zero residue. Test task deleted
  post-verify. Operator merges on green after Director clearance = working pattern.
  Closed roadmap #5 with #24 (converter). Full session: cold-start zero-drift verification
  → 4 feature slices shipped + cleared → 2 Director-authored migrations (RPC + chat, both
  simulated-JWT verified) → all banks current. Open at close: converter spot-check, 4
  storage files, Belts/Camp decision, source-lock-in (7 migrations), i18n desktop commit,
  Vercel MCP reconnect for next Director. Closed #5 with #24. Session totals: 4 feature
  slices shipped+cleared, 2 Director-authored migrations, 5 docs banks, zero open PRs at
  close. Handing off clean.
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
- **Migrations (in order, 22 total — verified live via list_migrations; ALL 22 mirrored in
  supabase/migrations/ — source-lock-in CLOSED 22/22):**
  core_schema_and_rls · harden_rls_helper_functions · revoke_anon_execute_role_helpers ·
  rls_initplan_optimization_and_missing_indexes · create_storage_buckets ·
  add_group_member_names_helper (tasks-slice RPC, roadmap #5.3) · add_group_messages_chat ·
  add_is_late_deadline_enforcement (is_late on receipts + no_receipt_notes; BEFORE INSERT
  trigger set_is_late(), SECURITY DEFINER pinned search_path, tamper-proof — overwrites any
  client-sent value) · revoke_authenticated_execute_set_is_late (advisor WARN remediated
  same session — NOT an accepted residual) · restrict_delete_on_data_bearing_fks
  (receipts/notes/tasks→groups + groups→projects flipped CASCADE→RESTRICT; user_roles +
  group_messages keep CASCADE by design — memberships/chat die with the group) ·
  add_duplicate_detection_trigger (is_duplicate on receipts via BEFORE-INSERT set_is_duplicate(),
  same group+amount+currency+receipt_date as a non-rejected receipt; tamper-proof) ·
  widen_receipt_photos_bucket_mime_types (#12, 20260703070915 — widens the receipt-photos
  bucket allowed mime types from image/* to the 7 attachment types for #43; applied ahead of
  the #43 merge) · add_receipt_note_soft_delete (#13, 20260704204035 — deleted_at timestamptz
  on receipts + no_receipt_notes + admin-only DELETE policies receipts_delete_admin /
  notes_delete_admin (is_admin()); powers #49 soft/hard delete; applied ahead of the #49 merge) ·
  exclude_soft_deleted_from_duplicate_check (#14, 20260704210822 — set_is_duplicate() now also
  requires r.deleted_at is null so a soft-deleted receipt no longer flags a new one; closes the
  #49 gap) · treasurer_remove_member_from_own_group (#15, 20260705061526 — additive scoped DELETE
  policy user_roles_treasurer_delete_member: role='member' AND is_treasurer_of(group_id); powers
  #57) · admin_insert_receipts_any_group (#16, 20260705133257 — additive admin INSERT policies
  receipts_insert_admin (submitted_by=self AND is_admin()) + receipt_photos_admin_insert on
  storage.objects; lets an admin file a receipt into ANY group; member policies untouched; powers
  #60). All Director-authored via MCP (Cody mirrors only). The first 11 committed verbatim as
  archival mirrors under supabase/migrations/ (#40, 6f3c329); #12 via #48; #13+#14 via #54; #15
  via #57; #16 via #60) · add_receipt_attachments_table (#17, 20260705225506 — receipt_attachments
  child table: id / receipt_id FK ON DELETE CASCADE / path / mime_type / created_at + index;
  RLS mirrors the parent receipt — select = admin/treasurer-of-group/owner, insert = owner AND
  member-of/admin, delete = admin; powers #62 multi-attachment) — #17 mirrored via #62 ·
  add_project_admin_role_foundation (#18, 20260709062325 — `alter type app_role add value
  'project_admin'` + `user_roles.project_id uuid references projects(id)`; the new role scopes by
  project, not group) · add_is_project_admin_helper (#19, 20260709062331 — is_project_admin_of(
  p_project_id) SECURITY DEFINER: true when the caller holds a project_admin user_roles row for that
  project; kept SEPARATE from is_admin(), never widens it) · project_admin_group_and_role_management
  (#20, 20260709062836 — projects_select_project_admin, groups_project_admin_write (ALL),
  user_roles_select_project_admin, user_roles_project_admin_write (insert treasurer/member only),
  user_roles_project_admin_delete; a project_admin manages groups + treasurer/member roles WITHIN
  their project) · fix_role_scope_constraints_for_project_admin (#21, 20260709062933 — drops the old
  admin_no_group + scoped_role_has_group check constraints, adds role_scope_admin (admin → no group,
  no project) / role_scope_project_admin (project_admin → project set, group null) / role_scope_group_roles
  (treasurer/member → group set); schema-constraint correction so the new scope shape is enforced) ·
  project_admin_names_and_spend_visibility (#22, 20260709070920 — widens get_group_member_names to
  also return names when the caller is_project_admin_of the group's project, and adds
  receipts_select_project_admin + notes_select_project_admin; CLOSES the two #64 gaps Cody flagged —
  names no longer uuid-fallback, spend/counts no longer read 0). #18–#22 all mirrored via #64.
  source-lock-in CLOSED 22/22. None re-run, live schema unchanged (#18/#21 are the only schema-shape
  changes — new enum value + column + constraint swap; all Director-authored via MCP, Cody mirrors only).
- **Schema:** profiles, projects, groups, user_roles (per-group role pairs; admin =
  org-wide, group_id null), receipts, no_receipt_notes, tasks, comments, group_messages,
  fx_rates.
  Enums: app_role (admin/treasurer/member), item_status (pending/reviewed/approved/
  rejected), task_status, expense_category (7). Helper fns: is_admin(), is_treasurer_of(),
  is_member_of(). receipts cols incl. receipt_date, photo_path, additional_info (note),
  usd_equivalent (nullable but locked at submit), reject_reason, is_duplicate, is_late.
  is_late (boolean, not null, default false) on BOTH receipts + no_receipt_notes — locked at
  submission by a BEFORE-INSERT trigger (usd_equivalent precedent); app never sets/sends it.
  ⚠️ NOTE for future UI: form 'date'→receipt_date, note→additional_info, storage→photo_path.
  - **projects cols:** id, name, created_at. Minimal — no description/status field yet.
  - **groups cols:** id, project_id, name, spending_limit (numeric, nullable),
    submission_deadline (date, nullable), created_at, updated_at. Has a
    `groups_set_updated_at` trigger (verified live) — app code must NOT set updated_at
    manually, let the trigger handle it.
  - **get_group_member_names(p_group_id)** — SECURITY DEFINER RPC returning {user_id,
    full_name} of a group's roster to callers who are admin/treasurer/member of it; pinned
    search_path, execute revoked from public+anon by name, granted authenticated;
    simulated-JWT verified; 4th accepted-residual definer WARN.
  - **group_messages** — per-group chat (id, group_id FK CASCADE — joins gated delete
    family, sender_id, body w/ non-empty check, created_at; index (group_id, created_at));
    RLS from birth: insert self+(group member OR admin), select group member OR admin;
    APPEND-ONLY like comments; simulated-JWT verified incl. cross-group blindness +
    constraint negative.
- **FK DELETE BEHAVIOR — data-bearing FKs now RESTRICT (CASCADE-wipe hazard RETIRED):**
  `groups → receipts`, `groups → no_receipt_notes`, `groups → tasks`, and `projects → groups`
  are ON DELETE **RESTRICT** (migration restrict_delete_on_data_bearing_fks). The DB now
  physically refuses (23503) to delete a group or project that still holds data — the old
  silent-wipe hazard is gone. `groups → user_roles` and `groups → group_messages` remain
  CASCADE by design: a group's memberships + chat history die with it (intended). Guarded
  delete UI is live on /console/projects (#35): counts children, disables when non-empty,
  confirms when empty, maps 23503 → friendly message.
- **RLS:** verified this session for the core loops —
  · receipts: insert (member of group + self), select (admin OR treasurer_of OR owner),
    update owner-while-pending, update treasurer/admin (approve/reject), DELETE admin-only
    (receipts_delete_admin, is_admin() — #49 hard delete). Same 4-policy shape on
    no_receipt_notes (notes_delete_admin). deleted_at (nullable) on both → soft delete via the
    update policies; every active read filters `deleted_at is null` (#49).
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
    self OR treasurer_of the group). Verified live, unchanged. NOTE (#46): DELETE is now
    exercised from the UI (per-chip role removal) — the ALL admin-write policy already
    covers it, no new RLS. Target key = id (PK, one row per user+role+group). App enforces a
    last-admin lockout in the server action (count admin rows, refuse when ≤ 1); the DB does
    not — the guard is app-level, so any future direct-API delete path must re-check it.
  · security-advisor: 3 accepted-residual WARNs (role-fns RPC-callable by authenticated,
    self-uid only, no leak) + 1 WARN "Leaked Password Protection Disabled" (Auth toggle,
    deferred). perf-advisor clean bar 1 cosmetic deferred.
- **Storage buckets:** receipt-photos (private, 10MB, image/*), signatures (private, 2MB,
  png/jpg) — RLS-scoped by group-id path convention. No storage-delete MCP tool exists;
  file deletion is operator-dashboard-only (see §12).
- **Vercel:** project `choose-life-treasurer` (prj_4rb6YuuNcJr6xrDKjTpPIiswnh6m, team
  team_IHCTzTPcdY47mLkznoU0idjD / roof-clean-pros-projects). Prod:
  https://choose-life-treasurer.vercel.app. Latest prod = 1f9d6d5 (merge #66), READY
  (independent preview checks ran on #29/#31/#33/#35/#37/#40/#45/#46; #39 was operator
  out-of-band — Director post-hoc verified 0 runtime errors). ⚠️ Vercel DROPPED the #45
  push-to-main webhook once (prod stuck on #44 after the #45 merge) — recovered with an empty
  re-trigger commit (bb5a04d); if a merge lands but no prod deploy appears, re-trigger the same way.
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
    (44580cea-…). (The "Belts"/"Camp" smoke-test project+group from #14 was DELETED via
    MCP this session — children counted 0 first, post-delete 0 rows; test data now clean.)
    fx_rates USD/EUR/MDL/KES/MXN/PLN (demo; EUR→USD ≈ 1.08).
  · receipts: 0 (the "Ifogbb" test receipt was DELETED via MCP this session, confirmed
    0 rows remaining — operator-cleared, dependency-checked first: 0 comment FKs).
  · storage receipt-photos: 2 objects still present under the Chisinau path (1 was
    linked to the now-deleted Ifogbb receipt, 1 is an orphan from an abandoned capture
    retry) — DB row is gone but the physical files remain; PENDING operator dashboard
    tap-delete (no MCP storage-delete tool; raw SQL delete would strand files worse).
- **Prod-ahead-of-repo drift — CLOSED (22/22):** all 22 live migrations are mirrored under
  supabase/migrations/ (11 via #40; #12 via #48; #13+#14 via #54; #15 via #57; #16 via #60;
  #17 via #62; #18–#22 via #64). The "mirror every new migration in-session" rule is satisfied.
  Going forward, any NEW Director-authored migration must still be mirrored in the same session.
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
- **Design tokens — SUPERSEDED by the design refresh (#51).** The original "Ledger" tokens
  were "FINAL/verbatim", but the operator explicitly requested a visual match to a reference
  mockup. The refresh is scope-constrained: reskin-only (colors/type/cards/spacing), NO
  route/nav restructure, NO manual role-switcher (real role-gating stays, just styled).
  New shared tokens/components are the new baseline (see below). Old locked-tokens rule no
  longer blocks visual changes made under this refresh.
- **`.num` is the numeric standard (reskin #51):** every numeric/currency/date/email value
  uses `className="num"` (IBM Plex Mono + tabular-nums) — a shared utility, NOT per-instance
  `font-mono`. New numeric UI adopts `.num`.
- **Shared reskin components (#51):** StatusPill / TaskStatusBadge = solid filled pill + white
  text per status; StatCard (uppercase label + bold value + tone); RoleBadge = role INDICATOR
  only (shows the viewer's actual role, never a switcher). Reuse these; don't one-off style.
- **SummaryCard spend fidelity — SUPERSEDED (#53).** The #51/#52 pass deferred the per-group
  spend rollup ("limit + counts only, no bar") as out-of-scope. The design-fidelity addendum
  then authorized it: getDashboard() now computes per-group spend = sum(usd_equivalent) of
  APPROVED, non-deleted receipts on the RLS client, and SummaryCard renders spent / of-limit +
  a gold progress bar (terracotta when >100%). Approved-only is the v1 spend definition (flips
  to include pending ONLY on operator word). Shipped #53; this is the live behavior.
- **Auth-user deletion confines the secret client to `auth.admin.deleteUser` ONLY (#50):**
  count authored-content FKs first (all NO ACTION) on the RLS client and block with counts;
  reuse the #46 last-admin guard. No other table/storage access on the secret client (§ below).
- **Treasurer member removal — RLS-scoped, member-only (#57, live migration #15):** treasurers
  remove MEMBERS from their OWN group(s) via a DELETE on user_roles on the RLS-respecting
  client; migration #15's user_roles_treasurer_delete_member policy (role='member' AND
  is_treasurer_of(group_id)) is the real gate. Never a treasurer/admin row, never another
  group, never the auth account (accounts stay admin-only, #50). 0 rows affected → friendly
  message, never a raw error. /console/users is role-branched: ADMIN sees the full page,
  TREASURER sees only their roster (names via get_group_member_names RPC — no admin client,
  no emails). Reuse this shape for any future treasurer-scoped write.
- **Admin any-group receipt capture — RLS-gated, submitted_by=self (#60, live migration #16):**
  admins file receipts into ANY group (chosen at capture time) via the SAME saveReceipt path —
  no privileged write. Migration #16's receipts_insert_admin (submitted_by=self AND is_admin())
  + receipt_photos_admin_insert (storage) are the gate; submitted_by stays self → auditable.
  is_late / is_duplicate stay trigger-owned (never sent by the app). Members unchanged. UI: the
  admin gets a required "Project · Group" dropdown of ALL groups (getAllGroupsForCapture on the
  RLS client); members keep the own-group flow.
- **Per-user activity view (#60, admin-only):** /console/users/[id] reads the user's
  receipts+notes (deleted_at is null, newest-first) on the RLS client (admin sees all); the email
  comes from a single auth.admin.getUserById (the ONLY admin-client use — auth.admin.* precedent,
  §8). Route re-checks admin defensively; the list link renders only in the admin branch.
- **Multi-attachment = child table, primary stays on the receipt (#62, live migration #17):**
  receipts.photo_path remains the PRIMARY evidence + OCR source; extra files live in
  receipt_attachments (RLS mirrors the parent). Capture: first image = primary, ≤5 extras
  uploaded to receipt-photos/{group_id}/ then one row each AFTER the receipt insert (best-effort —
  a failed attachment insert never fails the submission; the primary is intact). Display via a
  shared getReceiptAttachments (one batched select + one createSignedUrls) + a hook-free
  AttachmentLinks component reused across review/ledger/activity. Reuse this shape for any future
  "N files per row."
- **OCR speed pattern (#62):** downscale the image CLIENT-SIDE for the OCR call ONLY (~1600px,
  JPEG 0.75) — the STORED original is never touched (evidence quality preserved); run upload(s)
  and OCR in parallel (Promise.all); poll the Azure LRO soon (~600ms) with gentle backoff. All
  three keep the existing fail-closed-to-manual behavior. Trigger-owned fields (is_late,
  is_duplicate) are still never sent by the app.
- **Project Admin role — a THIRD scoped role, kept SEPARATE from is_admin (#64, live migrations
  #18–#22):** app_role gains 'project_admin' + user_roles.project_id; is_project_admin_of(project)
  is a NEW SECURITY DEFINER helper that NEVER widens is_admin() (org-admin stays org-wide, project
  admin stays project-scoped). A project_admin manages GROUPS + treasurer/member ROLES within their
  own project only — RLS (groups_project_admin_write, user_roles_project_admin_write/delete) is the
  real gate; server actions re-check the caller and use .select() to detect 0-row scope failures.
  NOT allowed: inviting new auth users (accounts stay admin-only, §8), touching another project,
  assigning admin/project_admin roles. /console/users is role-branched THREE ways (admin ·
  project_admin · treasurer). Role-scope check constraints (#21) enforce the shape: admin → no
  group/project, project_admin → project set + group null, treasurer/member → group set. Reuse
  is_project_admin_of() + this branch shape for any future project-scoped surface; never fold it
  into is_admin().
- **Data-layer widening follows the new role, one migration at a time (#22 closes #64's gaps):**
  a new scoped role does NOT automatically see names/spend — get_group_member_names + the
  receipts/notes SELECT policies were is_admin/is_treasurer/is_member only, so a project_admin got
  uuid-fallback names + 0 counts until migration #22 widened get_group_member_names (adds
  is_project_admin_of the group's project) and added receipts_select_project_admin +
  notes_select_project_admin. Precedent: when adding a role, audit EVERY read path it needs (name
  RPC, per-table SELECT) and widen each by migration — flag the gap at PR time, let the Director
  author the fix. Name resolution still goes through the RPC ONLY; profiles SELECT is never widened.
- **Group-expenses browsable page — read-only, RLS-scoped, all three roles (#66, no new migration):**
  /console/groups/[id] is a purpose-built on-page list of a group's receipts + notes (getGroupActivity
  on the RLS client, notFound() if out of scope), reusing the #60 activity rendering keyed on group_id
  (FilterPillRow + StatusPill + LATE/DUP + .num + AttachmentLinks). Migration #22's SELECT policies +
  groups_select (is_admin OR is_member_of — covers treasurers) mean admin/treasurer/project_admin all
  see real data with ZERO new RLS. The dashboard SummaryCard links here (repointed off the #65
  export-link). The /console/export download FORM stays a separate surface — a browsable list and a
  file export are distinct affordances; don't conflate them (the #65→#66 revise was exactly this
  correction).
- **Soft-delete pattern (#49):** `deleted_at` timestamptz + admin-only DELETE policy; treasurer
  soft-deletes (UPDATE deleted_at) / admin hard-deletes (DELETE); member soft-deletes own
  pending; EVERY active-data read must filter `deleted_at is null`. NOTE: DB triggers that
  scan the table (e.g. set_is_duplicate) are NOT auto-aware of deleted_at — update them by
  migration if soft-deleted rows must be excluded (open item, §CLEANUP).
- **Design tokens are FINAL** — "Ledger" direction locked; implement verbatim. (Superseded for
  visual changes by the #51 refresh above; retained as history.)
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
- **PDF surfaces MUST embed a full-Cyrillic font:** default PDF fonts (Helvetica) have NO
  Cyrillic glyphs → RU UGC renders blank. Register + EMBED a Cyrillic TTF (dejavu-fonts-ttf)
  as a data URI. On Vercel this also needs next.config serverExternalPackages (@react-pdf off
  the webpack/wasm path) + outputFileTracingIncludes (the .ttf is a data file, not an import,
  so trace it into the route's function). The font-embed leg is a hard pass/fail. (Established #37.)
- **Director sandbox-replication = accepted MEDIUM-HIGH verification:** when a route is
  auth-gated (Director can't hit it directly) and the operator waives the device leg, the
  Director may replicate the exact approach in a sandbox (same deps, same inputs, output
  round-trip check) to clear it. Not a full device pass — the exact deployed render remains
  first-real-use. (Established #37 — PDF font-embed proven via same @react-pdf/dejavu render +
  text-extraction round-trip.)
- **Reuse role-gating, don't reinvent:** console-only routes (users, review, projects) all
  mirror the SAME admin/treasurer gating pattern established in PR #5/#7. New console pages
  reuse it; they don't grow their own auth check. (Established through #7, #12, #14.)
- **Name resolution via get_group_member_names RPC ONLY** — never widen profiles RLS
  (contact privacy); profiles SELECT stays self-or-admin. (PR #20; gap caught pre-dispatch.)
- **Check RLS before dispatching, not after:** for admin-CRUD console features, verify live
  policies via MCP FIRST — if existing admin-write policies already cover the need (as with
  projects/groups), ship UI-only with zero new migration. Only author new RLS when a gap is
  actually found. (Established PR #14.)
- **Delete-feature gate — DECIDED & SHIPPED (was: CASCADE-delete tables get NO delete UI):**
  the guard mechanism is settled (operator chose DB-level RESTRICT over app-only guards) and
  delivered: data-bearing FKs are RESTRICT (migration restrict_delete_on_data_bearing_fks),
  and guarded delete UI is live on /console/projects (#35 — count-then-confirm, 23503→friendly
  message). Standing rule for FUTURE delete features on other tables: still verify FK on-delete
  behavior first; only ship a delete button once the DB refuses unsafe deletes (RESTRICT) or an
  app-level non-empty guard exists. Never a raw cascade into user data. (Established PR #14,
  resolved PR #35 — see §6, §9, §12.)

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
- **Delete features — guard decision MADE (RESTRICT) & SHIPPED:** Projects/Groups delete is
  now BUILT (#35) on DB-level RESTRICT FKs (operator's chosen guard). The gate is lifted for
  this surface. Any NEW delete feature elsewhere still needs the FK-behavior check first (§8).

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
- **CASCADE deletes on projects/groups — RETIRED (kept as history):** through PR #14–#33
  the data-bearing FKs were ON DELETE CASCADE, so a careless delete could silently wipe a
  project's receipts/tasks/notes/roles — which is why #14 shipped no delete UI. RESOLVED by
  restrict_delete_on_data_bearing_fks + guarded delete UI (#35): receipts/notes/tasks→groups
  and groups→projects are now RESTRICT (DB refuses non-empty deletes, 23503). Only
  user_roles + group_messages still CASCADE (memberships/chat die with the group, intended).
  See §6/§8/§9.
- **Slice 2/3 accepted residuals:** (a) tasks_update_assignee permits assignee any-column
  updates on own task via direct API; UI constrains to mark-done; column-restricting =
  Director-gated migration if ever needed. (b) tasks have no audit trail; status hops not
  individually provable post-hoc. (c) same-microsecond group_messages have nondeterministic
  order (random-UUID tiebreak) — cosmetic, unreachable at current scale. (d) comments+chat
  UI never device-tested — if a UI failure surfaces, the data layer beneath is already proven.
- **fx_rates staleness — PARTIALLY RETIRED** (was: all day-one demo values, seeded
  2026-07-01 05:58 UTC). Admin edit UI now live at /console/rates (#31) — MDL holds a real
  rate (0.056, updated 2026-07-02). EUR/KES/MXN/PLN are STILL day-one demo values — operator
  to true them up via /console/rates. Note: fx_rates has NO updated_at trigger, so the edit
  action sets updated_at=now() explicitly. Auto-fetch job remains a future candidate; the
  converter's "Rates as of" stamp + the 30-day stale banner keep staleness visible meanwhile.
- **Deadline semantics = SOFT flag (operator decision):** submissions are NEVER blocked
  past a group's submission_deadline — they're accepted and marked is_late=true. The
  BEFORE-INSERT trigger compares current_date (UTC) to the group's deadline at insert; the
  value is tamper-proof (client input overwritten). UI mirrors this: /capture + /no-receipt
  warn "will be marked LATE" but still submit. Test config restored clean: Chisinau/Balti
  submission_deadline back to null post-test (verified).
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
| 2026-07-01 | Choose Life Director 5.0 → 6.0 | Routine, operator-requested, at clean boundary — roadmap #5 complete, zero open PRs |

- **Director 6.0 session summary (no swap — still active):** features shipped — CSV #29 ·
  FX editor #31 · deadline #33 · guarded delete #35 · PDF #37 · dup detection #39 · Azure OCR
  #42 · attachments #43 · stuck-upload fix #44 · upload confirmation + ledger thumbnails #45 ·
  guarded role removal #46 · soft/hard delete #49 · delete user #50 · design refresh 1/3 #51 ·
  2/3 #53 · 3/3a #55 · 3/3b #56 (reskin COMPLETE) · treasurer member removal #57 · admin
  any-group capture + per-user activity #60 · OCR speed + multi-attachment #62 (fc7ff44) ·
  Project Admin role UI #64 (90de69c) · dashboard card links #65 (105c67a) · group-expenses
  page #66 (1f9d6d5) · 15 Director-authored migrations mirrored (is_late trigger · set_is_late
  revoke · RESTRICT-delete FKs · is_duplicate trigger · widen mime #12 · soft-delete #13 ·
  dup-excludes-soft-deleted #14 · treasurer-remove-member #15 · admin-insert-any-group #16 ·
  receipt_attachments #17 · project_admin foundation #18 · is_project_admin_of helper #19 ·
  project_admin group/role mgmt RLS #20 · role-scope constraint correction #21 · project_admin
  names + spend visibility #22) · CASCADE-wipe hazard RETIRED · roadmap #6 ALL buildable slices
  done incl. OCR (only i18n blocked) · design refresh COMPLETE · Project Admin role LIVE (kept
  fully separate from is_admin) · source-lock-in CLOSED 22/22 · #50 auth-delete e2e CLOSED
  (Dan+Dave deleted, 0 rows) · TEST DATA CLEARED (live receipts/notes/attachments all 0) · zero
  residue. NO open PRs at this bank — the dashboard-drill-in thread (#65 export-link → #66
  browsable list) is CLOSED. Owed (operator/desktop only): 4 orphan storage files;
  i18n seed + logos. prod = 1f9d6d5 (#66). Op notes: Vercel dropped the #45 push-to-main webhook
  once (recovered via empty commit); #50 merged operator-side pre-report (§12 pattern); #62
  merge delayed by a Vercel outage (banked OPEN in #63, corrected MERGED in #67).

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
5. No-receipt notes, tasks, comments, chat, currency converter — ✅ COMPLETE (#18, #20, #22, #24).
6. Cross-cutting — OPENED (Director 6.0), approved slice order:
   1. Export — ✅ COMPLETE: CSV (#29, 4abfa4f) + PDF (#37, 3b63bc5).
   2. Real FX — admin rate-edit UI ✅ DONE (#31, f90ca5e). /console/rates, USD locked.
   3. Deadline enforcement ✅ DONE (#33, afd7b16). Soft LATE flag (is_late trigger + UI).
   4. Guarded delete (Projects/Groups) ✅ DONE (#35, 9c8f478). RESTRICT FKs + count-then-confirm UI.
   5. Duplicate detection ✅ DONE (#39, 8d8278a). Advisory POSSIBLE DUPLICATE badge + CSV/PDF.
   6. Azure OCR ✅ DONE (#42, 36a7b05) — real Document Intelligence behind lib/ocr, confidence
      ≥ 0.5 gate, any failure → manual-entry fallback. NO LONGER BLOCKED (was "operator keys").
   7. Attachment support ✅ DONE (#43, 036f687) — images + PDF + Word; OCR skips non-image mime.
   ALL buildable slices SHIPPED (incl. OCR). OCR speed pass shipped in #62 (client downscale +
   parallel upload/OCR + tighter polling). Migrations source-lock-in CLOSED 22/22
   (#13/#14 via #54, #15 via #57, #16 via #60, #17 via #62, #18–#22 via #64).
   NOTE: the Project Admin role (#64) is a roadmap-adjacent org feature, not a #6 slice —
   new app_role 'project_admin', project-scoped group + role management (see §5/§6/§8).
   Remaining (BLOCKED, parked — no action pending):
   • i18n real-seed + logo drop-in — BLOCKED on desktop commit (ONLY remaining blocker).

POLISH / CLEANUP — DONE:
- ✅ Member Home → Console link (#13).
- ✅ Console dashboard "Export" button — dead placeholder removed (#13); a real Export
  surface now shipped at /console/export (roadmap #6 slice 1, CSV — #29).
- ✅ Test receipt "Ifogbb" — deleted via MCP, verified 0 rows.
- ✅ "Belts"/"Camp" smoke-test project+group — DELETED via MCP (0 rows), Director 6.0.
- ✅ ALL test receipts + notes cleared by the operator — live receipts / no_receipt_notes /
  receipt_attachments counts all 0 (MCP-verified 2026-07-06). Clean slate for real data.
- ✅ Migration #12 `widen_receipt_photos_bucket_mime_types` (20260703070915) — mirrored into
  supabase/migrations/ (#48, archival, byte-faithful vs live).
- ✅ Migrations #13 `add_receipt_note_soft_delete` + #14 `exclude_soft_deleted_from_duplicate_check`
  — mirrored (#54, archival). #15 `treasurer_remove_member_from_own_group` — mirrored (#57).
  #16 `admin_insert_receipts_any_group` — mirrored (#60). #17 `add_receipt_attachments_table`
  — mirrored (#62). #18–#22 (project_admin foundation · is_project_admin_of helper · group/role
  mgmt RLS · role-scope constraint correction · names + spend visibility) — mirrored (#64).
  Source-lock-in CLOSED at 22/22.
- ✅ Dup-detection trigger `set_is_duplicate` now excludes soft-deleted rows — Director-authored
  migration #14 (20260704210822), verified live. (The #49 gap is closed.)
- ✅ #50 delete-user e2e CLOSED — operator deleted Dan + Dave via the live app; verified 0 rows
  in auth.users. The irreversible auth.admin.deleteUser path is now proven end-to-end.

CLEANUP STILL PENDING:
- (operator action) 4 orphan storage files — dashboard tap-delete: 2 in receipt-photos
  (Chisinau path, historical) + 2 in signatures (fade7a24-…/ path, from the #18 prod smoke
  test; note row already MCP-deleted, verified 0 rows). No storage-delete MCP tool exists.
