"use client";

import { useEffect, useState } from "react";
import { ClusterCard } from "./cluster-card";

const API_URL = "http://127.0.0.1:8000";
const SESSION_ID = "bricklaying-level-3";

type ClusterItem = {
  id: number;
  clusterName: string;
  suggestedCategory: string;
  items: string[];
  notes: string;
};

export function ClusterGroupList() {
  const [clusters, setClusters] = useState<ClusterItem[]>([]);

  async function loadClusters() {
    try {
      const res = await fetch(`${API_URL}/ccpc/clusters/${SESSION_ID}`);
      const data = await res.json();
      setClusters(data || []);
    } catch (error) {
      console.error("Gagal load clusters:", error);
    }
  }

  useEffect(() => {
    loadClusters();

    const timer = setInterval(() => {
      loadClusters();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  if (clusters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-blue-700">
            Senarai Cluster AI
          </h2>
        </div>

        <div className="px-5 py-5 text-sm text-slate-500">
          Belum ada hasil clustering. Tekan butang{" "}
          <strong>Run AI Clustering</strong>.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Senarai Cluster AI
        </h2>
      </div>

      <div className="space-y-3 px-5 py-5">
        {clusters.map((cluster, index) => (
          <ClusterCard
            key={cluster.id}
            code={`CL-${String(index + 1).padStart(2, "0")}`}
            title={cluster.clusterName}
            count={cluster.items.length}
            confidence={cluster.suggestedCategory}
            active={index === 0}
          />
        ))}
      </div>
    </div>
  );
}