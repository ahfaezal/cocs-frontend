const reviewClusters = [
  {
    code: "CL-01",
    title: "Pengurusan Operasi Harian Masjid",
    category: "Core",
    approved: true,
  },
  {
    code: "CL-02",
    title: "Pentadbiran & Rekod Rasmi",
    category: "Core",
    approved: true,
  },
  {
    code: "CL-03",
    title: "Pengurusan Kewangan Masjid",
    category: "Core",
    approved: false,
  },
  {
    code: "CL-04",
    title: "Pengendalian Program & Dakwah",
    category: "Elective",
    approved: false,
  },
  {
    code: "CL-05",
    title: "Keselamatan, Fasiliti & Sokongan",
    category: "Elective",
    approved: false,
  },
];

export function FinalReviewSidebar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Senarai Cluster Finalisasi
        </h2>
      </div>

      <div className="space-y-3 px-5 py-5">
        {reviewClusters.map((cluster) => (
          <button
            key={cluster.code}
            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
              cluster.code === "CL-01"
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-blue-700">
                  {cluster.code}
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {cluster.title}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    cluster.category === "Core"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {cluster.category}
                </div>

                <div className="mt-2 text-xs font-semibold">
                  {cluster.approved ? (
                    <span className="text-emerald-700">Diluluskan</span>
                  ) : (
                    <span className="text-amber-700">Perlu Semakan</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}