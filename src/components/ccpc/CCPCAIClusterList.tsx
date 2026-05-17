"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  AICluster as BaseAICluster,
  ClusterSuggestionCategory,
  DACUMCard,
} from "@/lib/ccpc-ai-types";
import {
  ArrowRight,
  CheckCircle2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { API_URL } from "@/lib/env";

type AICluster = BaseAICluster & {
  clusterName?: string;
  items?: string[];
  finalised?: boolean;
  target?: {
    occupationTitle?: string;
    level?: string | number;
    subarea?: string;
  };
  targetIndex?: number;
};

type EditableCluster = {
  id: string;
  name: string;
  items: string[];
  finalised: boolean;
  source?: AICluster;
  target?: AICluster["target"];
  targetIndex?: number;
};

interface CCPCAIClusterListProps {
  clusters: AICluster[];
  selectedClusterId: string | null;
  onSelect: (clusterId: string) => void;
  readOnly?: boolean;
  proceedHref?: string;
  sessionId?: string;
  onClustersChange?: (clusters: AICluster[]) => void;
}

function normaliseClusterItems(cluster: AICluster): string[] {
  const rawItems: Array<string | DACUMCard> = cluster.items ?? cluster.cards ?? [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") return item;
      return item.text ?? "";
    })
    .filter((item) => item.trim().length > 0);
}

export function CCPCAIClusterList({
  clusters,
  selectedClusterId,
  onSelect,
  readOnly = false,
  proceedHref,
  sessionId,
  onClustersChange,
}: CCPCAIClusterListProps) {
  const [editableClusters, setEditableClusters] = useState<EditableCluster[]>(
    []
  );
  const [savingAll, setSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);

  useEffect(() => {
    const mapped = clusters.map((cluster, index) => {
      const clusterId = String(cluster.id ?? `cluster-${index}`);

      return {
        id: clusterId,
        name:
          cluster.clusterName ??
          cluster.suggestedName ??
          `Cluster ${index + 1}`,
        items: normaliseClusterItems(cluster),
        finalised: Boolean(cluster.finalised),
        source: cluster,
        target: cluster.target,
        targetIndex: cluster.targetIndex,
      };
    });

    const timer = window.setTimeout(() => {
      setEditableClusters(mapped);
      setAllSaved(mapped.length > 0 && mapped.every((cluster) => cluster.finalised));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [clusters]);

  function toAIClusters(items: EditableCluster[]): AICluster[] {
    return items.map((cluster) => {
      const cards = cluster.items.map((text, itemIndex) => ({
        id: `${cluster.id}-card-${itemIndex + 1}`,
        text,
      }));

      return {
        ...cluster.source,
        id: cluster.id,
        clusterName: cluster.name,
        suggestedName: cluster.name,
        items: cluster.items,
        cards,
        cardIds: cards.map((card) => card.id),
        confidence: cluster.source?.confidence ?? 0,
        suggestedCategory: (cluster.source?.suggestedCategory ??
          "Core Candidate") as ClusterSuggestionCategory,
        notes: cluster.source?.notes ?? "",
        finalised: cluster.finalised,
        target: cluster.target,
        targetIndex: cluster.targetIndex,
      };
    });
  }

  function publishClusters(next: EditableCluster[]) {
    setAllSaved(false);

    if (!onClustersChange) return;

    window.setTimeout(() => {
      onClustersChange(toAIClusters(next));
    }, 0);
  }

  function updateEditableClusters(
    updater: (clusters: EditableCluster[]) => EditableCluster[]
  ) {
    setEditableClusters((prev) => {
      const next = updater(prev);
      publishClusters(next);
      return next;
    });
  }

  function isClusterLocked(cluster: EditableCluster) {
    return readOnly || cluster.finalised;
  }

  function updateClusterName(clusterId: string, value: string) {
    updateEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId && !isClusterLocked(cluster)
          ? { ...cluster, name: value }
          : cluster
      )
    );
  }

  function updateItem(clusterId: string, itemIndex: number, value: string) {
    updateEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId && !isClusterLocked(cluster)
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
    if (readOnly) return;

    const newId = `manual-${Date.now()}`;
    const nextCluster: EditableCluster = {
      id: newId,
      name: "Nama Cluster Baharu",
      items: [""],
      finalised: false,
    };

    updateEditableClusters((prev) => [...prev, nextCluster]);
    onSelect(newId);
  }

  function addItem(clusterId: string) {
    updateEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId && !isClusterLocked(cluster)
          ? { ...cluster, items: [...cluster.items, ""] }
          : cluster
      )
    );
  }

  function deleteItem(clusterId: string, itemIndex: number) {
    updateEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId && !isClusterLocked(cluster)
          ? {
              ...cluster,
              items: cluster.items.filter((_, index) => index !== itemIndex),
            }
          : cluster
      )
    );
  }

  function deleteCluster(clusterId: string) {
    if (readOnly) return;

    const cluster = editableClusters.find((item) => item.id === clusterId);
    const confirmed = window.confirm(
      `Padam cluster "${cluster?.name || clusterId}"? Semua DACUM card dalam cluster ini akan dikeluarkan daripada senarai cluster.`
    );

    if (!confirmed) return;

    updateEditableClusters((prev) => {
      const next = prev.filter((item) => item.id !== clusterId);
      const nextSelected = next[0]?.id ?? null;

      if (selectedClusterId === clusterId && nextSelected) {
        window.setTimeout(() => onSelect(nextSelected), 0);
      }

      return next;
    });
  }

  function saveCluster(clusterId: string) {
    const cluster = editableClusters.find((item) => item.id === clusterId);

    if (!cluster || readOnly) return;

    publishClusters(editableClusters);
    alert(`Cluster "${cluster.name}" telah disimpan.`);
  }

  function finaliseCluster(clusterId: string) {
    updateEditableClusters((prev) =>
      prev.map((cluster) => {
        if (cluster.id !== clusterId || readOnly) return cluster;

        const cleanItems = cluster.items.filter((item) => item.trim().length > 0);

        if (!cluster.name.trim() || cleanItems.length === 0) {
          alert("Sila pastikan nama cluster dan sekurang-kurangnya satu DACUM card telah diisi.");
          return cluster;
        }

        return {
          ...cluster,
          name: cluster.name.trim(),
          items: cleanItems,
          finalised: true,
        };
      })
    );
  }

  function editCluster(clusterId: string) {
    if (readOnly) return;

    updateEditableClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === clusterId ? { ...cluster, finalised: false } : cluster
      )
    );
  }

  const finalisedCount = editableClusters.filter(
    (cluster) => cluster.finalised
  ).length;
  const allFinalised =
    editableClusters.length > 0 && finalisedCount === editableClusters.length;
  const canProceed = allFinalised && allSaved;

  async function saveAllClusters() {
    if (readOnly || !sessionId || !allFinalised) return;

    try {
      setSavingAll(true);
      const clustersToSave = toAIClusters(editableClusters);

      const res = await fetch(`${API_URL}/ccpc/clusters/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clusters: clustersToSave }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan hasil CCPC.");
      }

      publishClusters(editableClusters);
      setAllSaved(true);
      alert("Semua hasil finalised telah disimpan.");
    } catch (error) {
      console.error("Gagal simpan semua cluster:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan hasil finalised."
      );
    } finally {
      setSavingAll(false);
    }
  }

  if (!editableClusters || editableClusters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-blue-700">
              Senarai Cluster AI
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Belum ada hasil clustering. {" "}
              {readOnly ? (
                "Pegawai Penilai hanya boleh melihat hasil yang telah dijana."
              ) : (
                <>
                  Tekan butang <strong>Run AI Clustering</strong>.
                </>
              )}
            </p>
          </div>

          {!readOnly ? (
            <button
              type="button"
              onClick={addCluster}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              <Plus size={16} />
              Tambah Nama Cluster
            </button>
          ) : null}
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
            {readOnly
              ? "Semak cluster yang telah dijana untuk tujuan penilaian."
              : "Semak, tambah, edit dan finalise cluster sebelum diteruskan ke CCP."}
          </p>
        </div>

        {!readOnly ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addCluster}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              <Plus size={16} />
              Tambah Nama Cluster
            </button>

            {canProceed && proceedHref ? (
              <Link
                href={proceedHref}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <ArrowRight size={16} />
                Proceed to CCP
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Finalise semua cluster dan klik Save di bawah sebelum teruskan ke CCP"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <ArrowRight size={16} />
                Proceed to CCP
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
        Finalised: {" "}
        <span className="font-bold text-emerald-700">
          {finalisedCount}/{editableClusters.length}
        </span>
        {!allFinalised && !readOnly ? (
          <span className="ml-2 text-slate-500">
            Finalise semua cluster untuk aktifkan Proceed to CCP.
          </span>
        ) : allFinalised && !allSaved && !readOnly ? (
          <span className="ml-2 text-slate-500">
            Klik Save di bawah untuk menyimpan hasil finalised sebelum proceed.
          </span>
        ) : null}
      </div>

      <div className="space-y-5 p-4">
        {editableClusters.map((cluster, index) => {
          const active = selectedClusterId === cluster.id;
          const locked = isClusterLocked(cluster);

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

                  {cluster.target?.occupationTitle ? (
                    <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      Level {cluster.target.level || "-"} -{" "}
                      {cluster.target.occupationTitle}
                    </div>
                  ) : null}

                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Nama Cluster
                  </label>

                  {locked ? (
                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                      {cluster.name}
                    </div>
                  ) : (
                    <input
                      value={cluster.name}
                      onChange={(e) =>
                        updateClusterName(cluster.id, e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {cluster.finalised && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Finalised
                    </span>
                  )}

                  {!readOnly ? (
                    <>
                      {!cluster.finalised ? (
                        <>
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
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            editCluster(cluster.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                      )}

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
                    </>
                  ) : null}
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
                      {locked ? (
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {item || "-"}
                        </div>
                      ) : (
                        <>
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
                            title="Padam DACUM card"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {!locked ? (
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
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {!readOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-500">
            {allSaved
              ? "Hasil finalised telah disimpan. Anda boleh teruskan ke CCP."
              : "Selepas semua cluster difinalise, klik Save untuk simpan hasil sebelum proceed."}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveAllClusters}
              disabled={!allFinalised || savingAll || !sessionId}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              <Save size={16} />
              {savingAll ? "Menyimpan..." : "Save Hasil Finalised"}
            </button>

            {canProceed && proceedHref ? (
              <Link
                href={proceedHref}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <ArrowRight size={16} />
                Proceed to CCP
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <ArrowRight size={16} />
                Proceed to CCP
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
