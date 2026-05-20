"use client";

import { ExternalLink } from "lucide-react";

type LiveBoardToolbarProps = {
  readOnly?: boolean;
  sessionId: string;
  projectId?: string;
  sessionStatus?: "active" | "closed" | "draft";
};

export function LiveBoardToolbar({
  readOnly = false,
  sessionId,
  projectId,
  sessionStatus = "active",
}: LiveBoardToolbarProps) {
  const liveBoardHref = projectId
    ? `/ccpc/live-board?sessionId=${encodeURIComponent(
        sessionId
      )}&projectId=${encodeURIComponent(projectId)}`
    : `/ccpc/live-board?sessionId=${encodeURIComponent(sessionId)}`;
  const canOpenLiveBoard = Boolean(sessionId);

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
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                sessionStatus === "closed"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {sessionStatus === "closed" ? "Sesi Ditutup" : "Live Active"}
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
            {canOpenLiveBoard ? (
              <a
                href={liveBoardHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <ExternalLink size={16} />
                Buka Live Board
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white"
                title="Session Live Board sedang dimuatkan."
              >
                <ExternalLink size={16} />
                Memuatkan Live Board
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
