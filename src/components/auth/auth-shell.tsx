import { LocaleSwitcher } from "@/components/locale-switcher";

// Centered auth card on the light canvas. A soft shadow is allowed here — this
// is a modal-like surface (PROJECT_STATE §8 exception).
export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Choose Life</span>
          <LocaleSwitcher />
        </div>
        <div className="rounded-card border border-hairline bg-card p-6 shadow-sm">
          <h1 className="mb-5 text-lg font-semibold text-ink">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

// Shared input styling on the Ledger tokens.
export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-body">{label}</span>
      <input
        className="h-10 rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
        {...props}
      />
    </label>
  );
}
