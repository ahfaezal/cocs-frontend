"use client";

import { useEffect, useState } from "react";
import { ClusterCard } from "./cluster-card";
import { API_URL, DEFAULT_SESSION_ID } from "@/lib/env";

type ClusterItem = {
  id: number;
  clusterName: string;
  suggestedCategory: string;
  items: string[];
  notes: string;
};

export function ClusterGroupList() {
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
      console.error("Gagal load clusters:", error);
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
          Senarai Cluster AI
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Cluster dijana secara live daripada hasil AI clustering.
        </p>
      </div>

      <div className="px-5 py-5">
        {loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-400">
            Memuatkan cluster...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && clusters.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Belum ada hasil clustering. Tekan butang{" "}
            <strong>Run AI Clustering</strong>.
          </div>
        )}

        {!loading && !errorMessage && clusters.length > 0 && (
          <div className="space-y-3">
            {clusters.map((cluster, index) => (
              <ClusterCard
                key={`${cluster.id}-${index}`}
                code={`CL-${String(index + 1).padStart(2, "0")}`}
                title={cluster.clusterName}
                count={cluster.items?.length || 0}
                confidence={cluster.suggestedCategory}
                active={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}