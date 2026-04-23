import Link from "next/link";
import {
  Snowflake,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";

export function LiveBoardToolbar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-blue-700">Live Board (DACUM Card)</h2>
          <p className="mt-1 text-sm text-slate-500">
            Paparan langsung input kad panel untuk sesi semasa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Snowflake size={16} />
            Freeze
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-medium text-purple-700 transition hover:bg-purple-50">
            <Sparkles size={16} />
            AI Cluster (Preview)
          </button>

          <Link
            href="/ccpc/live-board"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ExternalLink size={16} />
            Buka Live Board
          </Link>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <EyeOff size={16} />
            Sembunyi Nama Panel
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Eye size={16} />
            Tunjuk Kad Baharu
          </button>
        </div>
      </div>
    </div>
  );
}