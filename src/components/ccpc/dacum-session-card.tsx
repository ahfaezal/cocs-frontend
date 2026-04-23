import { CircleDot, Clock3, Users, StickyNote } from "lucide-react";

export function DacumSessionCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Maklumat Sesi DACUM</h2>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Nama Sesi
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            defaultValue="Bricklaying-Level-3"
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Tajuk Standard
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
            defaultValue="Bricklayer (Wet Trade) Level 3"
            disabled
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CircleDot size={16} />
              Status Sesi
            </div>
            <div className="mt-2 text-lg font-semibold text-emerald-700">
              Live / Aktif
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock3 size={16} />
              Mula Sesi
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              21 Mei 2026, 9:00 AM
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={16} />
              Jumlah Panel
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">8 Panel</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <StickyNote size={16} />
              Kad Diterima
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">36 Kad</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Simpan Sesi
          </button>
          <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Aktifkan Sesi
          </button>
          <button className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50">
            Tutup Sesi
          </button>
        </div>
      </div>
    </div>
  );
}