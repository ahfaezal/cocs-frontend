type ClusterCardProps = {
  code: string;
  title: string;
  count: number;
  confidence: string;
  active?: boolean;
};

export function ClusterCard({
  code,
  title,
  count,
  confidence,
  active = false,
}: ClusterCardProps) {
  return (
    <button
      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
        active
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-blue-700">{code}</div>
          <div className="mt-1 text-base font-semibold text-slate-900">
            {title}
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {count} kad
        </span>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        Confidence: <span className="font-semibold text-emerald-700">{confidence}</span>
      </div>
    </button>
  );
}