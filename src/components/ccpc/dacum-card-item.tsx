type DacumCardItemProps = {
  text: string;
  time: string;
  isNew?: boolean;
  highlighted?: boolean;
};

export function DacumCardItem({
  text,
  time,
  isNew = false,
  highlighted = false,
}: DacumCardItemProps) {
  return (
    <div
      className={`rounded-none border border-slate-800 bg-white p-4 transition ${
        highlighted ? "bg-amber-50" : "bg-white"
      }`}
    >
      <div className="min-h-[72px] text-[22px] font-bold leading-tight text-slate-900">
        {text}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{time}</span>

        {isNew ? (
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase text-white">
            Baru
          </span>
        ) : null}
      </div>
    </div>
  );
}