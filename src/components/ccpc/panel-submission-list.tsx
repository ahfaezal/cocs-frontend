const submissions = [
  { name: "Panel 1", cards: 6, last: "10:12 AM" },
  { name: "Panel 2", cards: 4, last: "10:10 AM" },
  { name: "Panel 3", cards: 5, last: "10:14 AM" },
  { name: "Panel 4", cards: 3, last: "10:07 AM" },
  { name: "Panel 5", cards: 7, last: "10:15 AM" },
];

export function PanelSubmissionList() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Ringkasan Input Panel</h2>
      </div>

      <div className="space-y-3 px-5 py-5">
        {submissions.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <div className="font-semibold text-slate-900">{item.name}</div>
              <div className="mt-1 text-sm text-slate-500">
                Kad dihantar: {item.cards}
              </div>
            </div>

            <div className="text-right">
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Aktif
              </div>
              <div className="mt-1 text-xs text-slate-500">{item.last}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}