"use client";

import { useEffect, useState } from "react";
import { Plus, Save, CheckCircle2, Trash2, ArrowRight } from "lucide-react";

type AICluster = {
  id: number | string;
  clusterName?: string;
  suggestedName?: string;
  items?: string[];
  cards?: any[];
  notes?: string;
};

type EditableCluster = {
  id: string;
  name: string;
  items: string[];
  finalised: boolean;
};

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
  const [editableClusters, setEditableClusters] = useState<EditableCluster[]>(
    []
  );

  useEffect(() => {
    const mapped = clusters.map((cluster, index) => {
      const clusterId = String(cluster.id ?? `cluster-${index}`);
      const rawItems = cluster.items ?? cluster.cards ?? [];

      const items = rawItems.map((item: any) => {
        if (typeof item === "string") return item;
        return item.text ?? "";
      });

      return {
        id: clusterId,
        name:
          cluster.clusterName ??
          cluster.suggestedName ??
          `Cluster ${index + 1}`,
        items,
        finalised: false,
      };
    });

    setEditableClusters(mapped);
  }, [clusters]);

  function updateClusterName(clusterId: string, value: string) {
    setEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId ? { ...cluster, name: value } : cluster
      )
    );
  }

  function updateItem(clusterId: string, itemIndex: number, value: string) {
    setEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId
          ? {
              ...cluster,
              items: cluster.items.map((item, index) =>
                index === itemIndex ? value : item
              ),
            }
          : cluster
      )
    );
  }

  function addCluster() {
    const newId = `manual-${Date.now()}`;

    setEditableClusters((prev) => [
      ...prev,
      {
        id: newId,
        name: "Nama Cluster Baharu",
        items: [""],
        finalised: false,
      },
    ]);

    onSelect(newId);
  }

  function addItem(clusterId: string) {
    setEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId
          ? { ...cluster, items: [...cluster.items, ""] }
          : cluster
      )
    );
  }

  function deleteItem(clusterId: string, itemIndex: number) {
    setEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId
          ? {
              ...cluster,
              items: cluster.items.filter((_, index) => index !== itemIndex),
            }
          : cluster
      )
    );
  }

  function deleteCluster(clusterId: string) {
    setEditableClusters((prev) =>
      prev.filter((cluster) => cluster.id !== clusterId)
    );
  }

  function saveCluster(clusterId: string) {
    alert("Perubahan cluster telah disimpan sementara.");
  }

  function finaliseCluster(clusterId: string) {
    setEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId ? { ...cluster, finalised: true } : cluster
      )
    );
  }

  const finalisedCount = editableClusters.filter(
    (cluster) => cluster.finalised
  ).length;

  if (!editableClusters || editableClusters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-blue-700">
              Senarai Cluster AI
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Belum ada hasil clustering. Tekan butang{" "}
              <strong>Run AI Clustering</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={addCluster}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Plus size={16} />
            Tambah Nama Cluster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-700">
            Senarai Cluster AI
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Semak, tambah, edit dan finalise cluster sebelum diteruskan ke CCP.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addCluster}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Plus size={16} />
            Tambah Nama Cluster
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowRight size={16} />
            Proceed to CCP
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
        Finalised:{" "}
        <span className="font-bold text-emerald-700">
          {finalisedCount}/{editableClusters.length}
        </span>
      </div>

      <div className="space-y-5 p-4">
        {editableClusters.map((cluster, index) => {
          const active = selectedClusterId === cluster.id;

          return (
            <div
              key={`${cluster.id}-${index}`}
              onClick={() => onSelect(cluster.id)}
              className={`rounded-2xl border p-4 transition ${
                active
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-2 text-sm font-bold text-blue-700">
                    CL-{String(index + 1).padStart(2, "0")}
                  </div>

                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Nama Cluster
                  </label>

                  <input
                    value={cluster.name}
                    onChange={(e) =>
                      updateClusterName(cluster.id, e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {cluster.finalised && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Finalised
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveCluster(cluster.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Save size={15} />
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      finaliseCluster(cluster.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={15} />
                    Agree / Finalise
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCluster(cluster.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-800">
                    Senarai DACUM Card
                  </h4>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {cluster.items.length} kad
                  </span>
                </div>

                <div className="space-y-2">
                  {cluster.items.map((item, itemIndex) => (
                    <div
                      key={`${cluster.id}-${itemIndex}`}
                      className="flex gap-2"
                    >
                      <textarea
                        value={item}
                        onChange={(e) =>
                          updateItem(cluster.id, itemIndex, e.target.value)
                        }
                        rows={2}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                        placeholder="Masukkan DACUM card..."
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(cluster.id, itemIndex);
                        }}
                        className="rounded-xl border border-red-200 px-3 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(cluster.id);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  <Plus size={16} />
                  Tambah DACUM Card
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}