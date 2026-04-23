import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  Save,
  ArrowRight,
  ArrowLeft,
  Eye,
  FileText,
} from "lucide-react";
import { CSPStructureSidebar } from "@/components/csp/csp-structure-sidebar";
import { CSPDocumentHeader } from "@/components/csp/csp-document-header";

export const metadata: Metadata = {
  title: "Standard Practice (CSP)",
};

export default function CSPPage() {
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

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Dashboard</span>
          <ChevronRight size={16} />
          <span>Projek COCS</span>
          <ChevronRight size={16} />
          <span className="font-medium text-slate-700">
            Standard Practice (CSP)
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Standard Practice (CSP)
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Lengkapkan kandungan dokumen CSP mengikut struktur Standard
                Practice COCS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <FileText size={16} />
              Salin dari Templat
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <Eye size={16} />
              Pratonton
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
              <Save size={16} />
              Simpan
            </button>
          </div>
        </div>
      </div>

      <CSPDocumentHeader
        bidangPekerjaan="Bricklaying (Wet Trade)"
        tahap="3"
        laluanKerjaya="Kerja Batu dan Konkrit"
        tarikhKemaskini="20 Mei 2024"
        versiDokumen="0.1 (Draf)"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <CSPStructureSidebar />

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-blue-700">
                    1. Pengenalan
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Lengkapkan seksyen pengenalan bagi dokumen CSP.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Disimpan 10:42 AM
                </span>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Latar Belakang
                </label>
                <textarea
                  className="min-h-[160px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  defaultValue="Industri pembinaan di Malaysia memainkan peranan yang sangat penting dalam pembangunan infrastruktur dan kemudahan awam serta swasta. Kerja batu dan konkrit merupakan antara kemahiran teras yang diperlukan dalam pelaksanaan projek pembinaan struktur."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Industry Overview
                </label>
                <textarea
                  className="min-h-[140px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  defaultValue="Sektor pembinaan sentiasa berkembang seiring dengan peningkatan projek pembangunan di seluruh negara. Permintaan terhadap tenaga kerja mahir bagi kerja bata dan konkrit adalah tinggi terutamanya dalam projek bangunan, jambatan, struktur bertetulang dan kemudahan infrastruktur lain."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Occupational Definition
                </label>
                <textarea
                  className="min-h-[140px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  defaultValue="Bricklayer (Wet Trade) Tahap 3 ialah pekerja yang melaksanakan kerja pasangan bata, blok dan kerja konkrit mengikut lukisan, spesifikasi dan prosedur kerja yang telah ditetapkan dengan tahap kesukaran sederhana serta pengawasan minimum."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-blue-700">
                Panduan CSP
              </h2>
            </div>

            <div className="space-y-3 px-6 py-6 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                Lengkapkan setiap seksyen mengikut struktur Standard Practice COCS.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                Kandungan dalam CSP hendaklah konsisten dengan COS, CCPC dan CCP
                yang telah disahkan.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                Gunakan bahasa formal, deskriptif, dan selari dengan keperluan
                badan kawalselia.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/ccp"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Kembali ke CCP
            </Link>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                <Save size={16} />
                Simpan Draf
              </button>

              <Link
                href="/ccc"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Seterusnya: CCC
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="text-sm leading-6 text-slate-700">
          <span className="font-semibold">Nota:</span> Fasa awal CSP memberi
          fokus kepada struktur dokumen dan pengisian kandungan mengikut seksyen.
          Pada langkah seterusnya, kita boleh tambah editor yang lebih maju dan
          integrasi AI untuk membantu cadangan kandungan setiap seksyen.
        </div>
      </div>
    </div>
  );
}