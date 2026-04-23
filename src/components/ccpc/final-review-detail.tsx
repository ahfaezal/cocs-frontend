"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  Pencil,
  Tag,
  Save,
  Sparkles,
} from "lucide-react";

const finalItems = [
  "Pantau perjalanan program masjid",
  "Sedia jadual tugas bilal",
  "Ganti imam tidak hadir",
  "Selaras tugasan jawatankuasa",
  "Semak bacaan imam bertugas",
  "Lafaz iqamah solat fardu",
  "Pimpin bacaan wirid jemaah",
  "Baca doa selepas solat",
];

export function FinalReviewDetail() {
  const router = useRouter();

  // Mock validation semasa
  // Tukar nilai ini nanti ikut state/API sebenar
  const totalClusters = 5;
  const approvedClusters = 2;
  const categorizedClusters = 5;
  const unassignedItems = 4;

  const canGenerate =
    approvedClusters === totalClusters &&
    categorizedClusters === totalClusters &&
    unassignedItems === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-blue-700">
            Perincian Semakan Cluster
          </h2>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nama Cluster / Cadangan Kompetensi
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                defaultValue="Pengurusan Operasi Harian Masjid"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kategori Akhir
              </label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Core</option>
                <option>Elective</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <Tag size={18} className="mt-0.5 text-blue-700" />
              <p className="text-sm leading-6 text-slate-600">
                Pada peringkat ini, fasilitator boleh memuktamadkan nama cluster,
                tetapkan kategori akhir, dan meluluskan cluster untuk dijana ke
                format CCPC.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-3 text-lg font-semibold text-slate-900">
              Item Dalam Cluster
            </div>

            <div className="space-y-3">
              {finalItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Pencil size={16} />
              Edit Nama
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Save size={16} />
              Simpan Semakan
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
              <CheckCircle2 size={16} />
              Approve Cluster
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50">
              <Lock size={16} />
              Lock Cluster
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-blue-700">Tindakan Akhir</h2>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Generate CCPC hanya dibenarkan selepas semua cluster disahkan, semua
            kategori ditetapkan, dan tiada item belum dipadankan.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={!canGenerate}
              onClick={() => {
                if (!canGenerate) return;

                alert("CCPC berjaya dijana (mock)");
                // Bila dah ready, buka baris bawah ini:
                // router.push("/ccp");
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
                canGenerate
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              <Sparkles size={16} />
              Generate CCPC
            </button>

            {!canGenerate ? (
              <div className="flex items-center text-sm text-amber-700">
                Lengkapkan semua semakan sebelum generate.
              </div>
            ) : (
              <div className="flex items-center text-sm text-emerald-700">
                Semua syarat lengkap. Sistem sedia untuk jana CCPC.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}