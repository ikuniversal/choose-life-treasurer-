import { cn } from "@/lib/utils";

// Reskin: role indicator in the console shell. Shows ONLY the viewer's ACTUAL
// authenticated role (Admin or Treasurer) as an active-styled accent pill — not
// a switcher, just styling of the existing role-gated context.
export function RoleBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill bg-amber px-3 py-1 text-xs font-semibold text-white",
        className,
      )}
    >
      {label}
    </span>
  );
}
