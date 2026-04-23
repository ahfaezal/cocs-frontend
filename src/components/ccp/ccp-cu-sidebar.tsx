import { Search, ArrowRight } from "lucide-react";
import { CCPCUStatusBadge } from "./ccp-cu-status-badge";

const cuItems = [
  {
    code: "C01-CU01",
    title: "Check stock level",
    status: "Lengkap" as const,
    active: true,
  },
  {
    code: "C01-CU02",
    title: "Check storage condition",
    status: "PC Dijana" as const,
  },
  {
    code: "C01-CU03",
    title: "Handle incoming material",
    status: "Work Step Dijana" as const,
  },
  {
    code: "C01-CU04",
    title: "Select and prepare material",
    status: "Perlu Semakan" as const,
  },
  {
    code: "C01-CU05",
    title: "Store material at site",
    status: "Belum Jana AI" as const,
  },
];

export function CCPCUSidebar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Senarai Competency Unit
        </h2>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Cari Competency Unit..."
          />
        </div>

        <div className="space-y-3">
          {cuItems.map((item) => (
            <button
              key={item.code}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                item.active
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-blue-700">
                    {item.code}
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {item.title}
                  </div>
                </div>

                <ArrowRight size={16} className="mt-1 text-slate-400" />
              </div>

              <div className="mt-3">
                <CCPCUStatusBadge status={item.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}