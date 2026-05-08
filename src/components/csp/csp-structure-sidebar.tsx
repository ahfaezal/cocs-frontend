const cspSections = [
  { no: 1, title: "Front Page & Maklumat Dokumen", active: true },
  { no: 2, title: "Construction Occupational Structure (COS)" },
  { no: 3, title: "Definition of Competency Levels" },
  { no: 4, title: "Occupational Competencies" },
  { no: 5, title: "Organisation Reference" },
  { no: 6, title: "Technical Evaluation Committee" },
  { no: 7, title: "Standard Development Committee" },
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
