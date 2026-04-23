type CUPreview = {
  code: string;
  title: string;
};

type CCPCPreviewCardProps = {
  code: string;
  title: string;
  category: "Core" | "Elective";
  statement: string;
  cus: CUPreview[];
};

export function CCPCPreviewCard({
  code,
  title,
  category,
  statement,
  cus,
}: CCPCPreviewCardProps) {
  const categoryClass =
    category === "Core"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <div className="text-sm font-bold text-blue-700">{code}</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {title}
          </div>
        </div>

        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${categoryClass}`}>
          {category}
        </span>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Pernyataan Kompetensi
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {statement}
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-700">
            Cadangan Unit Kompetensi (CU)
          </div>

          <div className="space-y-3">
            {cus.map((cu) => (
              <div
                key={cu.code}
                className="rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="text-sm font-bold text-blue-700">{cu.code}</div>
                <div className="mt-1 text-sm text-slate-700">{cu.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}