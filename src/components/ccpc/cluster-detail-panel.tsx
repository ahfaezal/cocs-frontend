import {
  Pencil,
  GitMerge,
  Split,
  Trash2,
  CheckCircle2,
  Tag,
} from "lucide-react";

const clusterItems = [
  "Pantau perjalanan program masjid",
  "Sedia jadual tugas bilal",
  "Ganti imam tidak hadir",
  "Selaras tugasan jawatankuasa",
  "Semak bacaan imam bertugas",
  "Lafaz iqamah solat fardu",
  "Pimpin bacaan wirid jemaah",
  "Baca doa selepas solat",
];

export function ClusterDetailPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-blue-700">Perincian Cluster</h2>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nama Cluster
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              defaultValue="Pengurusan Operasi Harian Masjid"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Cadangan Kategori
            </label>
            <div className="flex h-[50px] items-center rounded-xl border border-slate-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
              Core Candidate
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <Tag size={18} className="mt-0.5 text-blue-700" />
            <p className="text-sm leading-6 text-slate-600">
              AI mencadangkan cluster ini sebagai kumpulan tugasan berkait operasi
              harian dan pengendalian fungsi asas masjid. Fasilitator boleh ubah
              nama cluster, merge, split, atau luluskan cluster ini.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 text-lg font-semibold text-slate-900">
            Senarai Kad Dalam Cluster
          </div>

          <div className="space-y-3">
            {clusterItems.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Pencil size={16} />
            Rename Cluster
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-medium text-purple-700 transition hover:bg-purple-50">
            <GitMerge size={16} />
            Merge Cluster
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Split size={16} />
            Split Cluster
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50">
            <Trash2 size={16} />
            Exclude Item
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            <CheckCircle2 size={16} />
            Approve Cluster
          </button>
        </div>
      </div>
    </div>
  );
}