import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, X, Save, ArrowRight, ArrowLeft } from "lucide-react";
import { ProjectFormStepper } from "@/components/projects/project-form-stepper";

export const metadata: Metadata = {
  title: "Cipta Projek Baharu",
};

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Projek COCS</span>
            <ChevronRight size={16} />
            <span>Permohonan Projek</span>
            <ChevronRight size={16} />
            <span className="font-medium text-blue-700">Cipta Projek Baharu</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Cipta Projek Baharu
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Lengkapkan maklumat asas untuk memulakan pembangunan COCS.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Kembali ke Senarai Projek
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <ProjectFormStepper currentStep={1} />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold tracking-wide text-blue-700">
              MAKLUMAT ASAS PROJEK
            </h2>
          </div>

          <div className="space-y-8 px-6 py-6">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tajuk Projek <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Standard Kemahiran Pemasangan Bata (Bricklaying) Tahap 3"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kod Projek
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                  placeholder="Akan dijana secara automatik"
                  disabled
                />
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Jenis Pembangunan <span className="text-red-500">*</span>
                </label>

                <div className="flex h-[50px] items-center gap-6 rounded-xl border border-slate-200 px-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="jenis-pembangunan" defaultChecked />
                    <span>Baharu</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="jenis-pembangunan" />
                    <span>Kaji Semula</span>
                  </label>
                </div>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bidang Pekerjaan <span className="text-red-500">*</span>
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option>Sila pilih bidang</option>
                </select>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tred / Occupation <span className="text-red-500">*</span>
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option>Sila pilih tred / occupation</option>
                </select>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tahap Sasaran <span className="text-red-500">*</span>
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option>Sila pilih tahap (1–6)</option>
                </select>
              </div>

              <div className="xl:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tahun Sasaran <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Pilih tahun"
                />
              </div>

              <div className="xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sektor <span className="text-red-500">*</span>
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option>Sila pilih sektor</option>
                </select>
              </div>

              <div className="xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subsektor <span className="text-red-500">*</span>
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option>Sila pilih subsektor</option>
                </select>
              </div>

              <div className="xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Area
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option>Sila pilih area</option>
                </select>
              </div>

              <div className="xl:col-span-12">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ringkasan Projek <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="min-h-[150px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Nyatakan ringkasan projek secara ringkas..."
                />
                <div className="mt-2 text-right text-xs text-slate-400">0 / 500</div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="mb-5 text-base font-bold tracking-wide text-blue-700">
                KLASIFIKASI & RUJUKAN
              </h3>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kod MSIC (2008)
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cth: 41001"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kod MASCO
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cth: 7111-01"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Rujukan Akta 520 (Jadual Ketiga)
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cth: Item 19 – Kerja Bata"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Versi Standard (jika kaji semula)
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cth: 2018 / Versi 2.0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <X size={16} />
              Batal
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
              <Save size={16} />
              Simpan Draf
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
              Seterusnya
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}