"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const SESSION_ID = "bricklaying-level-3";

type ClusterItem = {
  id: number;
  clusterName: string;
  suggestedCategory: string;
  items: string[];
  notes: string;
};

export function FinalReviewSidebar() {
  const [clusters, setClusters] = useState<ClusterItem[]>([]);

  async function loadClusters() {
    try {
      const res = await fetch(`${API_URL}/ccpc/clusters/${SESSION_ID}`);
      const data = await res.json();
      setClusters(data || []);
    } catch (error) {
      console.error("Gagal load final review clusters:", error);
    }
  }

  useEffect(() => {
    loadClusters();

    const timer = setInterval(loadClusters, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Senarai Cluster Finalisasi
        </h2>
      </div>

      <div className="space-y-3 px-5 py-5">
        {clusters.length === 0 && (
          <p className="text-sm text-slate-500">
            Belum ada cluster untuk difinalkan.
          </p>
        )}

        {clusters.map((cluster, index) => {
          const category =
            cluster.suggestedCategory === "Core Candidate"
              ? "Core"
              : cluster.suggestedCategory === "Elective Candidate"
              ? "Elective"
              : "Review";

          return (
            <button
              key={cluster.id}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                index === 0
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-blue-700">
                    CL-{String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {cluster.clusterName}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {cluster.items.length} item
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      category === "Core"
                        ? "bg-emerald-100 text-emerald-700"
                        : category === "Elective"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {category}
                  </div>

                  <div className="mt-2 text-xs font-semibold text-amber-700">
                    Perlu Semakan
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}