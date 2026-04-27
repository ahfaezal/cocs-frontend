"use client";

type AICluster = {
  id?: number | string;
  clusterName?: string;
  suggestedName?: string;
  suggestedCategory?: string;
  items?: string[];
  cards?: {
    id?: string | number;
    text?: string;
  }[];
  notes?: string;
};

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

  const clusterTitle =
    cluster.clusterName ?? cluster.suggestedName ?? "Untitled Cluster";

  const clusterItems =
    cluster.items ??
    cluster.cards?.map((card) => card.text ?? "").filter(Boolean) ??
    [];

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

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
              {clusterTitle}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Cadangan Kategori
            </label>

            <div
              className={`inline-flex rounded-xl px-4 py-3 text-sm font-semibold ${badgeClass}`}
            >
              {cluster.suggestedCategory ?? "Review Required"}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 px-4 py-4 text-sm leading-6 text-slate-700">
          {cluster.notes ||
            "AI telah menjana cluster ini berdasarkan persamaan maksud kad input."}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-800">
            Senarai Kad Dalam Cluster
          </h4>

          <div className="space-y-2">
            {clusterItems.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-400">
                Tiada kad dalam cluster ini.
              </p>
            )}

            {clusterItems.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                {index + 1}. {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}