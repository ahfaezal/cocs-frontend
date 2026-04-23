"use client";

import { AIClusterResult } from "@/lib/ccpc-ai-types";

interface CCPCClusteringSummaryProps {
  result: AIClusterResult | null;
  isRunning: boolean;
}

export function CCPCClusteringSummary({
  result,
  isRunning,
}: CCPCClusteringSummaryProps) {
  const totalCards = result?.totalCards ?? 0;
  const uniqueCards = result?.uniqueCards ?? 0;
  const suggestedClusterCount = result?.suggestedClusterCount ?? 0;
  const statusLabel = isRunning
    ? "Sedang Diproses"
    : result?.status === "ready"
    ? "Sedia Diproses"
    : "Belum Dijana";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-blue-700">Kawalan AI Clustering</h3>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Jumlah Kad Input</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{totalCards}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Kad Unik</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{uniqueCards}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Cluster Dicadangkan</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{suggestedClusterCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Status AI</p>
          <p className="mt-2 text-xl font-bold text-emerald-700">{statusLabel}</p>
        </div>
      </div>
    </div>
  );
}