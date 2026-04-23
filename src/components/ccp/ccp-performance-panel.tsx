import { Sparkles } from "lucide-react";

const mockPC = [
  "Stok bahan diperiksa dengan tepat mengikut rekod semasa",
  "Kekurangan bahan dikenal pasti dengan jelas",
  "Rekod stok disimpan secara sistematik",
  "Makluman keperluan dihantar kepada pihak berkaitan",
  "Bahan mencukupi sebelum kerja dimulakan",
];

export function CCPPerformancePanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-purple-700">
          Performance Criteria
        </h3>

        <button className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
          <Sparkles size={16} />
          Jana AI
        </button>
      </div>

      <div className="space-y-3 px-5 py-5">
        {mockPC.map((pc, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <span className="font-semibold text-slate-700 mr-2">
              {i + 1}.
            </span>
            {pc}
          </div>
        ))}
      </div>
    </div>
  );
}