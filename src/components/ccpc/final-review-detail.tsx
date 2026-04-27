"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Pencil, Trash2, MoveRight } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const SESSION_ID = "bricklaying-level-3";

type ClusterItem = {
  id: number;
  cluster_name: string;
  suggested_category: string;
  items_json: string;
  notes: string;
};

export function FinalReviewDetail() {
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function loadClusters() {
    try {
      const res = await fetch(`${API_URL}/ccpc/clusters/${SESSION_ID}`);
      const data = await res.json();
      setClusters(data || []);

      if (data?.length > 0 && selectedId === null) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadClusters();
  }, []);

  const activeCluster =
    clusters.find((item) => item.id === selectedId) || null;

  const items = activeCluster
    ? JSON.parse(activeCluster.items_json || "[]")
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
      {/* LEFT */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-blue-700">
            Finalisasi Cluster
          </h2>
        </div>

        <div className="space-y-3 p-4">
          {clusters.map((cluster) => (
            <button
              key={cluster.id}
              onClick={() => setSelectedId(cluster.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                selectedId === cluster.id
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="text-xs font-bold text-blue-700">
                Cluster {cluster.id}
              </div>

              <div className="mt-1 font-bold text-slate-800">
                {cluster.cluster_name}
              </div>

              <div className="mt-2 text-sm text-slate-500">
                {cluster.suggested_category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!activeCluster ? (
          <div className="p-10 text-center text-slate-400">
            Tiada cluster dipilih.
          </div>
        ) : (
          <>
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-blue-700">
                    Cluster {activeCluster.id}
                  </div>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {activeCluster.cluster_name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {activeCluster.notes}
                  </p>
                </div>

                <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {activeCluster.suggested_category}
                </div>
              </div>
            </div>

            <div className="space-y-3 px-6 py-6">
              {items.map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="text-sm font-medium text-slate-700">
                    {index + 1}. {item}
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                      <MoveRight size={16} />
                    </button>

                    <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                      <Pencil size={16} />
                    </button>

                    <button className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                <CheckCircle2 size={18} />
                Approve Final Cluster
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}