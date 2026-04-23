import {
  QrCode,
  ExternalLink,
  Snowflake,
  Sparkles,
  BadgeCheck,
  FileOutput,
} from "lucide-react";

export function CCPCActionBar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50">
          <QrCode size={16} />
          Jana QR Panel
        </button>

        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50">
          <ExternalLink size={16} />
          Buka Panel Input
        </button>

        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
          <Snowflake size={16} />
          Freeze Board
        </button>

        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-purple-700 transition hover:bg-purple-50">
          <Sparkles size={16} />
          Run AI Clustering
        </button>

        <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 font-medium text-emerald-700 transition hover:bg-emerald-50">
          <BadgeCheck size={16} />
          Approve Final Cluster
        </button>

        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
          <FileOutput size={16} />
          Generate CCPC
        </button>
      </div>
    </div>
  );
}