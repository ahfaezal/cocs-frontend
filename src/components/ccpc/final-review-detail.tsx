"use client";

interface FinalReviewDetailProps {
  clusterName?: string;
  finalCategory?: string;
  items?: string[];
  approvedClusters?: number;
  totalClusters?: number;
  categorizedClusters?: number;
  unassignedItems?: number;
  onEditName?: () => void;
  onSaveReview?: () => void;
  onApproveCluster?: () => void;
  onLockCluster?: () => void;
}

export function FinalReviewDetail({
  clusterName = "Pengurusan Operasi Harian Masjid",
  finalCategory = "Core",
  items = [
    "Pantau perjalanan program masjid",
    "Sedia jadual tugas bilal",
    "Ganti imam tidak hadir",
    "Selaras tugasan jawatankuasa",
    "Semak bacaan imam bertugas",
    "Lafaz iqamah solat fardu",
    "Pimpin bacaan wirid jemaah",
    "Baca doa selepas solat",
  ],
  approvedClusters = 2,
  totalClusters = 5,
  categorizedClusters = 5,
  unassignedItems = 4,
  onEditName,
  onSaveReview,
  onApproveCluster,
  onLockCluster,
}: FinalReviewDetailProps) {
  // pastikan semua nilai memang number
  const approved = Number(approvedClusters);
  const total = Number(totalClusters);
  const categorized = Number(categorizedClusters);
  const unassigned = Number(unassignedItems);

  const canGenerate =
    approved === total &&
    categorized === total &&
    unassigned === 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-blue-700">
          Perincian Semakan Cluster
        </h3>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nama Cluster / Cadangan Kompetensi
            </label>
            <input
              type="text"
              value={clusterName}
              readOnly
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Kategori Akhir
            </label>
            <select
              value={finalCategory}
              disabled
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none"
            >
              <option value="Core">Core</option>
              <option value="Elective">Elective</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 px-4 py-4 text-sm text-slate-700">
          Pada peringkat ini, fasilitator boleh memuktamadkan nama cluster,
          tetapkan kategori akhir, dan meluluskan cluster untuk dijana ke format CCPC.
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-800">
            Item Dalam Cluster
          </h4>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onEditName}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit Nama
          </button>

          <button
            type="button"
            onClick={onSaveReview}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Simpan Semakan
          </button>

          <button
            type="button"
            onClick={onApproveCluster}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Approve Cluster
          </button>

          <button
            type="button"
            onClick={onLockCluster}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
          >
            Lock Cluster
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm font-semibold text-slate-800">
            Status Penjanaan CCPC
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Approved Clusters: <span className="font-semibold">{approved}</span> / {total}
          </p>
          <p className="text-sm text-slate-600">
            Categorized Clusters: <span className="font-semibold">{categorized}</span> / {total}
          </p>
          <p className="text-sm text-slate-600">
            Unassigned Items: <span className="font-semibold">{unassigned}</span>
          </p>

          <div className="mt-4">
            {canGenerate ? (
              <div className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800">
                Semua syarat dipenuhi. CCPC sedia untuk dijana.
              </div>
            ) : (
              <div className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-800">
                CCPC belum boleh dijana. Lengkapkan semua semakan terlebih dahulu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}