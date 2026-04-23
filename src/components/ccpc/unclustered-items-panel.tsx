const unclusteredItems = [
  "Jemput penceramah jemputan luar",
  "Semak bacaan imam bertugas",
  "Lafaz iqamah solat fardu",
  "Baca doa selepas solat",
];

export function UnclusteredItemsPanel() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
      <div className="border-b border-amber-200 px-5 py-4">
        <h2 className="text-lg font-bold text-amber-700">
          Item Belum Dipadankan
        </h2>
      </div>

      <div className="space-y-3 px-5 py-5">
        {unclusteredItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}