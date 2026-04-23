const cspSections = [
  { no: 1, title: "Pengenalan", active: true },
  { no: 2, title: "Rasional Pembangunan COCS" },
  { no: 3, title: "Rasional Struktur Pekerjaan" },
  { no: 4, title: "Keperluan Badan Kawalselia" },
  { no: 5, title: "Prasyarat Umum Pekerjaan" },
  { no: 6, title: "Struktur Pekerjaan (COS)" },
  { no: 7, title: "Definisi Tahap" },
  { no: 8, title: "Kompetensi Pekerjaan" },
  { no: 9, title: "Kondisi Kerja" },
  { no: 10, title: "Prospek Pekerjaan" },
  { no: 11, title: "Peluang Peningkatan Kemahiran" },
  { no: 12, title: "Organisasi Rujukan" },
  { no: 13, title: "Jawatankuasa" },
];

export function CSPStructureSidebar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Struktur CSP</h2>
      </div>

      <div className="space-y-2 px-4 py-4">
        {cspSections.map((section) => (
          <button
            key={section.no}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
              section.active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                section.active
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {section.no}
            </div>
            <span className="text-sm font-medium">{section.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}