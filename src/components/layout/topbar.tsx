import { Bell, Building2, ChevronDown, UserCircle2 } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          <Building2 size={18} />
          <span>CIDB Malaysia</span>
          <ChevronDown size={16} />
        </button>

        <button className="relative rounded-xl p-2 hover:bg-slate-100">
          <Bell className="text-slate-700" size={22} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <button className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100">
          <UserCircle2 size={40} className="text-slate-700" />
          <div className="text-left text-sm">
            <div className="font-semibold text-slate-900">
              Fasilitator Utama
            </div>
            <div className="text-slate-500">Fasilitator</div>
          </div>
          <ChevronDown size={16} className="text-slate-600" />
        </button>
      </div>
    </header>
  );
}