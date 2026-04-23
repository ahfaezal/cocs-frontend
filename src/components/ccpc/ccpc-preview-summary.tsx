type CCPCPreviewSummaryProps = {
  totalCompetencies: number;
  coreCount: number;
  electiveCount: number;
  totalCU: number;
};

export function CCPCPreviewSummary({
  totalCompetencies,
  coreCount,
  electiveCount,
  totalCU,
}: CCPCPreviewSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Ringkasan Preview CCPC
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Jumlah Kompetensi</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totalCompetencies}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm text-emerald-700">Kompetensi Core</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {coreCount}
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="text-sm text-purple-700">Kompetensi Elective</div>
          <div className="mt-2 text-2xl font-bold text-purple-700">
            {electiveCount}
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm text-blue-700">Jumlah Cadangan CU</div>
          <div className="mt-2 text-2xl font-bold text-blue-700">
            {totalCU}
          </div>
        </div>
      </div>
    </div>
  );
}