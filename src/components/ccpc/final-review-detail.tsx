"use client";

import { useEffect, useState } from "react";
import { API_URL, DEFAULT_SESSION_ID } from "@/lib/env";

type ClusterItem = {
  id: number;
  clusterName: string;
  suggestedCategory: string;
  items: string[];
  notes?: string;
};

export function FinalReviewDetail() {
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
      console.error("Gagal load final review detail:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
      setClusters([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClusters();

    const timer = setInterval(() => {
      loadClusters();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Final Review Detail
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Semakan akhir cluster sebelum generate CCPC.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-400">
            Memuatkan data semakan...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && clusters.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Belum ada cluster untuk disemak.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          clusters.length > 0 &&
          clusters.map((cluster, index) => (
            <div
              key={`${cluster.id}-${index}`}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {cluster.clusterName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {cluster.suggestedCategory}
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {cluster.items?.length || 0} Item
                </span>
              </div>

              {cluster.items?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {cluster.items.map((item, itemIndex) => (
                    <div
                      key={`${cluster.id}-${itemIndex}`}
                      className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {cluster.notes && (
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <span className="font-semibold">Nota:</span>{" "}
                  {cluster.notes}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}