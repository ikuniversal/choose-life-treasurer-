// Minimal, dependency-free CSV serialization for the console export
// (roadmap #6 slice 1). Excel-friendly: UTF-8 BOM prefix + CRLF row endings +
// RFC-4180 quoting. All values are rendered verbatim — UGC (vendor, description,
// reject reason, names) is NEVER translated or transformed (PROJECT_STATE §8).

const BOM = "﻿";
const CRLF = "\r\n";

// Quote a single field when it contains a quote, comma, CR or LF; double any
// embedded quotes. Null/undefined render as an empty field.
function escapeField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/["\r\n,]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Serialize a header row + data rows into a full CSV document (BOM + CRLF).
export function toCsv(
  header: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const lines = [header, ...rows].map((row) => row.map(escapeField).join(","));
  return BOM + lines.join(CRLF) + CRLF;
}
