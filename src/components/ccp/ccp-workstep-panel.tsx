import { Sparkles, Plus, Trash2 } from "lucide-react";

const mockData = [
  {
    step: "Periksa tahap stok bahan",
    pc: "Stok bahan diperiksa dengan tepat mengikut rekod semasa",
  },
  {
    step: "Kenal pasti kekurangan bahan",
    pc: "Kekurangan bahan dikenal pasti dengan jelas",
  },
  {
    step: "Rekod status stok semasa",
    pc: "Rekod stok disimpan secara sistematik",
  },
  {
    step: "Maklumkan keperluan penambahan stok",
    pc: "Makluman keperluan dihantar kepada pihak berkaitan",
  },
  {
    step: "Sahkan kecukupan bahan sebelum kerja bermula",
    pc: "Bahan mencukupi sebelum kerja dimulakan",
  },
];

export function CCPWorkStepPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-blue-700">
          Work Step & Performance Criteria
        </h3>

        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Sparkles size={16} />
          Jana AI
        </button>
      </div>

      <div className="space-y-3 px-5 py-5">
        {mockData.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            {/* Work Step */}
            <div className="flex items-start justify-between">
              <div className="text-sm text-slate-800">
                <span className="font-semibold mr-2">{i + 1}.</span>
                {item.step}
              </div>

              <button className="text-slate-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Performance Criteria */}
            <div className="mt-2 text-sm text-slate-600 pl-6">
              → {item.pc}
            </div>
          </div>
        ))}

        <button className="inline-flex items-center gap-2 text-sm text-blue-600 font-medium">
          <Plus size={16} />
          Tambah Work Step
        </button>
      </div>
    </div>
  );
}