# App icons — PENDING assets

The manifest (`/public/manifest.webmanifest`) references:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-maskable-512.png` (512×512, maskable safe zone)

These are **not yet committed.** The Choose Life logo assets (`CLeng.png`
cross-in-circle emblem, `CLlogo1.png` wordmark) referenced in PROJECT_STATE §4
did not arrive in the Code Agent environment through the operator relay, and
both existing variants are white/monochrome — a dark or full-color variant is
needed for the light canvas (`#faf7f1`) regardless.

**Follow-up:** drop the source logo in, generate the three PNGs above (e.g. via
`sharp` or an icon generator), commit them here, and remove this note. Until
then a PWA install will fall back to a default icon; the app still builds/runs.
