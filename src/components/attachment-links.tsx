import { Paperclip } from "lucide-react";
import type { AttachmentLink } from "@/lib/data/receipt-attachments";

// Presentational, hook-free → usable in both server and client trees. Shows the
// attachment count + a signed-URL link per extra file (the #43 download pattern:
// links open in a new tab; images and docs alike). `label` is the translated
// word for "Attachments", passed by the caller (server or client).
export function AttachmentLinks({
  attachments,
  label,
}: {
  attachments: AttachmentLink[];
  label: string;
}) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <Paperclip className="h-3.5 w-3.5" aria-hidden />
        {label} ({attachments.length})
      </span>
      {attachments.map((a, i) => (
        <a
          key={i}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          // file name is UGC — never translated
          title={a.name}
          className="max-w-[10rem] truncate rounded-input border border-hairline px-2 py-0.5 text-xs text-olive transition-colors hover:bg-hairline-row"
        >
          {a.name}
        </a>
      ))}
    </div>
  );
}
