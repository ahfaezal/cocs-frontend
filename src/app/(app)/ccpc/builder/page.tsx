import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  FileCheck2,
  Pencil,
  Plus,
  Save,
  ArrowRight,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CCPC Builder",
};

const generatedCompetencies = [
  {
    code: "C01",
    title: "Pengurusan Operasi Harian Masjid",
    category: "Core",
    statement:
      "Mengurus dan menyelaras operasi harian masjid bagi memastikan perjalanan aktiviti asas, ibadah, dan fungsi pentadbiran berjalan lancar.",
    cus: [
      { code: "C01-CU01", title: "Rancang operasi harian masjid" },
      { code: "C01-CU02", title: "Laksana tugasan operasi asas masjid" },
      { code: "C01-CU03", title: "Pantau kelancaran operasi harian" },
    ],
  },
  {
    code: "C02",
    title: "Pentadbiran & Rekod Rasmi",
    category: "Core",
    statement:
      "Mengurus dokumen, surat-menyurat, dan rekod rasmi masjid secara sistematik mengikut keperluan pentadbiran semasa.",
    cus: [
      { code: "C02-CU01", title: "Urus dokumen dan rekod rasmi" },
      { code: "C02-CU02", title: "Sediakan dokumentasi aktiviti masjid" },
    ],
  },
  {
    code: "E01",
    title: "Pengendalian Program & Dakwah",
    category: "Elective",
    statement:
      "Mengurus pelaksanaan program dakwah, ceramah, dan aktiviti khas masjid mengikut keperluan organisasi dan komuniti.",
    cus: [
      { code: "E01-CU01", title: "Rancang program dakwah masjid" },
      { code: "E01-CU02", title: "Selaras pelaksanaan program khas" },
    ],
  },
];

export default function CCPCBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Projek:</span>
            <span className="text-2xl font-bold text-blue-700">
              COCS/2024/001 – Bricklayer (Wet Trade) Level 3
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Status:</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              CCPC Dijana
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Dashboard</span>
          <ChevronRight size={16} />
          <span>Projek COCS</span>
          <ChevronRight size={16} />
          <span>CCPC</span>
          <ChevronRight size={16} />
          <span className="font-medium text-slate-700">CCPC Builder</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <FileCheck2 size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                CCPC Builder
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Hasil cluster yang telah dijana kini dipaparkan sebagai struktur
                kompetensi dan unit kompetensi untuk semakan lanjut.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <Eye size={16} />
              Pratonton
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <Save size={16} />
              Simpan Draf
            </button>

            <Link
              href="/ccp"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Seterusnya: CCP
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Jumlah Kompetensi</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">3</div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-700">Kompetensi Core</div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">2</div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <div className="text-sm text-purple-700">Kompetensi Elective</div>
            <div className="mt-2 text-2xl font-bold text-purple-700">1</div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-700">Jumlah CU</div>
            <div className="mt-2 text-2xl font-bold text-blue-700">7</div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {generatedCompetencies.map((competency) => (
          <div
            key={competency.code}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-sm font-bold text-blue-700">
                  {competency.code}
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {competency.title}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    competency.category === "Core"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {competency.category}
                </span>

                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <Pencil size={16} />
                  Edit Kompetensi
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">
                  Pernyataan Kompetensi
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {competency.statement}
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-700">
                    Unit Kompetensi (CU)
                  </div>

                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-slate-50">
                    <Plus size={16} />
                    Tambah CU
                  </button>
                </div>

                <div className="space-y-3">
                  {competency.cus.map((cu) => (
                    <div
                      key={cu.code}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-blue-700">
                          {cu.code}
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          {cu.title}
                        </div>
                      </div>

                      <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        <Pencil size={16} />
                        Edit CU
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="text-sm leading-6 text-slate-700">
          <span className="font-semibold">Nota:</span> Struktur ini ialah hasil
          awal penjanaan daripada cluster yang telah diluluskan. Fasilitator boleh
          membuat semakan akhir sebelum meneruskan ke modul CCP.
        </div>
      </div>
    </div>
  );
}