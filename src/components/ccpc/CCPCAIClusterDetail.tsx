"use client";

import { AICluster } from "@/lib/ccpc-ai-types";

interface CCPCAIClusterDetailProps {
  cluster: AICluster | null;
}

export function CCPCAIClusterDetail({ cluster }: CCPCAIClusterDetailProps) {
  if (!cluster) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-blue-700">Perincian Cluster</h3>
        <p className="mt-3 text-sm text-slate-500">
          Pilih satu cluster untuk melihat perincian.
        </p>
      </div>
    );
  }

  const badgeClass =
    cluster.suggestedCategory === "Core Candidate"
      ? "bg-emerald-100 text-emerald-700"
      : cluster.suggestedCategory === "Elective Candidate"
      ? "bg-violet-100 text-violet-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-blue-700">Perincian Cluster</h3>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nama Cluster
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
              {cluster.suggestedName}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Cadangan Kategori
            </label>
            <div className={`inline-flex rounded-xl px-4 py-3 text-sm font-semibold ${badgeClass}`}>
              {cluster.suggestedCategory}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 px-4 py-4 text-sm text-slate-700">
          {cluster.notes || "AI telah menjana cluster ini berdasarkan persamaan maksud kad input."}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-800">Senarai Kad Dalam Cluster</h4>
          <div className="space-y-2">
            {cluster.cards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                {card.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}