"use client";

import { useEffect, useState } from "react";
import { API_URL, DEFAULT_SESSION_ID } from "@/lib/env";

type ClusterItem = {
  id: number;
  clusterName: string;
  suggestedCategory: string;
  items: string[];
  notes: string;
};

export function FinalReviewSidebar() {
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadClusters() {
    try {
      setErrorMessage("");

      const res = await fetch(
        `${API_URL}/ccpc/clusters/${DEFAULT_SESSION_ID}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Gagal mendapatkan cluster.");
      }

      const data = await res.json();
      setClusters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal load final review clusters:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
      setClusters([]);
    } finally {
      setLoading(false);
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

        <p className="mt-1 text-sm text-slate-500">
          Semakan akhir sebelum generate dokumen CCPC.
        </p>
      </div>

      <div className="space-y-3 px-5 py-5">
        {loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
            Memuatkan cluster...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && clusters.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Belum ada cluster untuk difinalkan.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          clusters.map((cluster, index) => {
            const category =
              cluster.suggestedCategory === "Core Candidate"
                ? "Core"
                : cluster.suggestedCategory === "Elective Candidate"
                ? "Elective"
                : "Review";

            return (
              <button
                key={`${cluster.id}-${index}`}
                type="button"
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
                      {cluster.items?.length || 0} item
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