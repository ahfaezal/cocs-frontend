import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  FileText,
  Route,
  Upload,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  X,
  Save,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Occupational Analysis (COS)",
};

type CareerRow = {
  level: number;
  jobTitle: string;
  description: string;
  target?: boolean;
};

type CareerPath = {
  id: number;
  title: string;
  active?: boolean;
  rows: CareerRow[];
};

const careerPaths: CareerPath[] = [
  {
    id: 1,
    title: "Kerja Batu dan Konkrit",
    active: true,
    rows: [
      {
        level: 6,
        jobTitle: "Construction Project Manager",
        description:
          "Mengurus keseluruhan projek pembinaan, perancangan strategik, kos dan sumber.",
      },
      {
        level: 5,
        jobTitle: "Construction Manager",
        description:
          "Mengurus pelaksanaan projek di tapak, penyeliaan pasukan dan kawalan kualiti.",
      },
      {
        level: 4,
        jobTitle: "Site Supervisor",
        description:
          "Menyelia kerja harian di tapak, memastikan pematuhan spesifikasi dan keselamatan.",
      },
      {
        level: 3,
        jobTitle: "Bricklayer / Wet Trade Foreman",
        description:
          "Menyelia kerja pasangan bata dan konkrit, agihan tugasan dan kawalan mutu kerja.",
        target: true,
      },
      {
        level: 2,
        jobTitle: "Bricklayer 2",
        description:
          "Melaksanakan kerja pasangan bata dan konkrit mengikut arahan dan spesifikasi.",
      },
      {
        level: 1,
        jobTitle: "Bricklayer 1",
        description:
          "Membantu kerja pasangan bata dan konkrit asas di bawah pengawasan.",
      },
    ],
  },
  {
    id: 2,
    title: "Kerja Plaster dan Render",
    active: true,
    rows: [],
  },
];

function LevelBadge({
  level,
  target = false,
}: {
  level: number;
  target?: boolean;
}) {
  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold";

  if (target) {
    return <span className={`${base} bg-emerald-500 text-white`}>{level}</span>;
  }

  const map: Record<number, string> = {
    6: "bg-violet-100 text-violet-700",
    5: "bg-indigo-100 text-indigo-700",
    4: "bg-blue-100 text-blue-700",
    3: "bg-emerald-100 text-emerald-700",
    2: "bg-amber-100 text-amber-700",
    1: "bg-orange-100 text-orange-700",
  };

  return <span className={`${base} ${map[level] || "bg-slate-100 text-slate-700"}`}>{level}</span>;
}

function CareerPathTable({ path }: { path: CareerPath }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-slate-900">
            Laluan Kerjaya {path.id}:
          </div>
          <div className="text-2xl font-semibold text-blue-700">{path.title}</div>
          {path.active ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Aktif
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-slate-50">
            <Pencil size={16} />
            Ubah Laluan
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
            <Trash2 size={16} />
            Padam Laluan
          </button>

          <button className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50">
            <ChevronUp size={16} />
          </button>

          <button className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {path.rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="w-[110px] px-5 py-4 font-semibold">Tahap</th>
                <th className="px-5 py-4 font-semibold">
                  Jawatan / Pekerjaan (Laluan {path.id})
                </th>
                <th className="px-5 py-4 font-semibold">
                  Deskripsi Ringkas Tanggungjawab
                </th>
              </tr>
            </thead>

            <tbody>
              {path.rows.map((row) => (
                <tr
                  key={`${path.id}-${row.level}`}
                  className={`border-b border-slate-100 ${
                    row.target ? "bg-emerald-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <LevelBadge level={row.level} target={row.target} />

                      {row.target ? (
                        <span className="h-3 w-3 rounded-full border-2 border-emerald-600 bg-white" />
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`font-semibold ${
                          row.target ? "text-emerald-700" : "text-slate-800"
                        }`}
                      >
                        {row.jobTitle}
                      </span>

                      {row.target ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                          Tahap Sasaran
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 py-5">
          <div className="text-sm text-slate-500">
            Laluan ini masih belum dipaparkan dalam bentuk jadual ringkas.
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-slate-50">
            <Eye size={16} />
            Lihat Struktur
          </button>
        </div>
      )}
    </div>
  );
}

export default function COSPage() {
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
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              Dalam Pembangunan
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Dashboard</span>
            <ChevronRight size={16} />
            <span>Projek COCS</span>
            <ChevronRight size={16} />
            <span className="font-medium text-slate-700">
              Occupational Analysis (COS)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Occupational Analysis (COS)
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50">
            <FileText size={16} />
            Rasional Struktur
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50">
            <Route size={16} />
            Laluan Kerjaya
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50">
            <Upload size={16} />
            Import Struktur
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
            <Plus size={16} />
            Tambah Laluan
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-3 xl:grid-cols-6">
          <div>
            <div className="text-sm text-slate-500">Sektor</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Construction
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Subsektor</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Building
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Area</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              Architectural
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Tahap Sasaran Standard</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-600">
              Level 3
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Laluan Kerjaya Aktif</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">2</div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">Tarikh Kemaskini</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                20 Mei 2024
              </div>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Pencil size={16} />
              Edit Maklumat
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2 text-blue-700">
              <Info size={18} />
            </div>

            <div>
              <div className="text-lg font-semibold text-slate-900">Arahan</div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                Bina struktur pekerjaan mengikut tahap 1 hingga 6. Tandakan tahap
                sasaran standard pada jawatan yang berkaitan. Anda boleh menambah
                beberapa laluan kerjaya bagi bidang pekerjaan ini.
              </p>
            </div>
          </div>

          <div className="min-w-[250px]">
            <div className="text-sm font-semibold text-slate-700">Rujukan:</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-blue-700">
                Akta 520 (Jadual Ketiga)
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-blue-700">MSIC 2008</span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-blue-700">MASCO</span>
            </div>
          </div>
        </div>
      </div>

      <CareerPathTable path={careerPaths[0]} />
      <CareerPathTable path={careerPaths[1]} />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2 text-amber-700">
            <Lightbulb size={18} />
          </div>

          <div>
            <div className="text-lg font-semibold text-slate-900">Nota:</div>
            <p className="mt-1 text-sm text-slate-600">
              Simpan struktur sebelum meneruskan ke langkah seterusnya (CCPC).
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
          <X size={16} />
          Batal
        </button>

        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
          <Save size={16} />
          Simpan Draf
        </button>

        <Link
          href="/ccpc"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Simpan & Seterusnya
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}