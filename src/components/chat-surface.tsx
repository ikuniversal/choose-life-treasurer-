"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GroupChat } from "@/components/group-chat";

// Group picker + chat. Reused by the member and console chat pages. When the
// user belongs to a single group, the picker is hidden.
export function ChatSurface({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const t = useTranslations("chat");
  const [selected, setSelected] = useState(groups[0]?.id ?? "");

  if (groups.length === 0) {
    return (
      <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
        {t("noGroup")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.length > 1 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("group")}</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <GroupChat key={selected} groupId={selected} />
    </div>
  );
}
