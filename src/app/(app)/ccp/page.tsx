import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { CCPRecordHeader } from "@/components/ccp/ccp-record-header";
import { CCPCUSidebar } from "@/components/ccp/ccp-cu-sidebar";
import { CCPWorkStepPanel } from "@/components/ccp/ccp-workstep-panel";
import { CCPPerformancePanel } from "@/components/ccp/ccp-performance-panel";

export const metadata: Metadata = {
  title: "Competency Profile (CCP)",
};

export default function CCPPage() {
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
            Competency Profile (CCP)
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Competency Profile (CCP)
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Modul ini memfokuskan kepada pemantapan descriptor kompetensi,
                Work Step, dan Performance Criteria berdasarkan hasil proses CCPC.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <Sparkles size={16} />
              Jana AI
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
              <Save size={16} />
              Simpan
            </button>
          </div>
        </div>
      </div>

      <CCPRecordHeader
        section="(F) CONSTRUCTION"
        group="(302) MANUFACTURE OF RAILWAY AND ROLLING STOCK"
        area="PERMANENT WAY (TRACKWORK)"
        cocsTitle="RAILWAY"
        cocsLevel="ONE (1)"
        code="CC01"
        competencyTitle="Install Track Component"
        competencyCode="CC01"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <CCPCUSidebar />

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-blue-700">
                    Workspace Competency Unit
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pilih Competency Unit di sebelah kiri untuk menjana Work Step
                    dan Performance Criteria.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  C01-CU01 Dipilih
                </span>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="text-sm font-semibold text-slate-700">
                  Competency Unit
                </div>
                <div className="mt-2 text-xl font-bold text-slate-900">
                  Check stock level
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-600">
                  Unit ini akan digunakan untuk menjana cadangan Work Step lengkap
                  dan Performance Criteria secara lebih sistematik menggunakan AI.
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <FileCheck2 size={18} className="mt-0.5 text-blue-700" />
                  <div className="text-sm leading-6 text-slate-600">
                    Pada peringkat ini, fasilitator akan:
                    <div className="mt-2 space-y-1">
                      <div>1. Menyemak Competency Unit yang dipilih</div>
                      <div>2. Menjana cadangan Work Step lengkap</div>
                      <div>
                        3. Menjana Performance Criteria yang dipadankan 1:1
                      </div>
                      <div>
                        4. Menyemak sama ada kandungan membentuk complete circle
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <CCPWorkStepPanel />
                <CCPPerformancePanel />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <div className="text-sm leading-6 text-slate-700">
                  <span className="font-semibold">Nota:</span> Work Step dan
                  Performance Criteria di atas masih menggunakan mock data untuk
                  Fasa CCP-2. Langkah seterusnya ialah menghubungkan butang
                  “Jana AI” kepada penjanaan sebenar menggunakan OpenAI.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/ccpc"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Kembali ke CCPC
            </Link>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                <Save size={16} />
                Simpan Draf
              </button>

              <Link
                href="/csp"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Seterusnya: CSP
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="text-sm leading-6 text-slate-700">
          <span className="font-semibold">Nota:</span> Maklumat rekod rasmi CCP
          diambil daripada proses terdahulu dan tidak boleh diubah. Fasa
          seterusnya akan memberi fokus kepada penjanaan AI untuk Work Step dan
          Performance Criteria.
        </div>
      </div>
    </div>
  );
}