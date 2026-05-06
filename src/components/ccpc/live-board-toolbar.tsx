"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

type LiveBoardToolbarProps = {
  readOnly?: boolean;
  sessionId: string;
  projectId?: string;
};

export function LiveBoardToolbar({
  readOnly = false,
  sessionId,
  projectId,
}: LiveBoardToolbarProps) {
  const liveBoardHref = projectId
    ? `/ccpc/live-board?sessionId=${encodeURIComponent(
        sessionId
      )}&projectId=${encodeURIComponent(projectId)}`
    : `/ccpc/live-board?sessionId=${encodeURIComponent(sessionId)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-blue-700">
            Live Board (DACUM Card)
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Paparan langsung input kad panel untuk sesi semasa.
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
              Live Active
            </span>

            {readOnly ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                Mode Semakan
              </span>
            ) : null}
          </div>
        </div>

        {!readOnly ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={liveBoardHref}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ExternalLink size={16} />
              Buka Live Board
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
