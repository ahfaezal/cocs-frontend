"use client";

import { AICluster } from "@/lib/ccpc-ai-types";

interface CCPCAIClusterListProps {
  clusters: AICluster[];
  selectedClusterId: string | null;
  onSelect: (clusterId: string) => void;
}

export function CCPCAIClusterList({
  clusters,
  selectedClusterId,
  onSelect,
}: CCPCAIClusterListProps) {
  if (clusters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-blue-700">Senarai Cluster AI</h3>
        <p className="mt-3 text-sm text-slate-500">
          Belum ada hasil clustering. Tekan butang <strong>Run AI Clustering</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-blue-700">Senarai Cluster AI</h3>
      </div>

      <div className="space-y-3 p-4">
        {clusters.map((cluster) => {
          const active = selectedClusterId === cluster.id;

          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => onSelect(cluster.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                active
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-blue-700">{cluster.id}</p>
                  <h4 className="mt-1 text-base font-bold text-slate-800">
                    {cluster.suggestedName}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Confidence: <span className="font-semibold">{cluster.confidence}%</span>
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {cluster.cards.length} kad
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}