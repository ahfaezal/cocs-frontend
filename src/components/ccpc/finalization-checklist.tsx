type FinalizationChecklistProps = {
  totalClusters: number;
  approvedClusters: number;
  unassignedItems: number;
  categorizedClusters: number;
};

export function FinalizationChecklist({
  totalClusters,
  approvedClusters,
  unassignedItems,
  categorizedClusters,
}: FinalizationChecklistProps) {
  const allApproved = approvedClusters === totalClusters;
  const allCategorized = categorizedClusters === totalClusters;
  const noUnassigned = unassignedItems === 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Status Semakan Akhir</h2>
      </div>

      <div className="space-y-3 px-5 py-5 text-sm">
        <div className="rounded-xl border border-slate-200 px-4 py-3">
          {allApproved ? "✅" : "❌"} Semua cluster disahkan
          <span className="ml-2 font-semibold text-slate-700">
            ({approvedClusters}/{totalClusters})
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 px-4 py-3">
          {allCategorized ? "✅" : "❌"} Semua cluster mempunyai kategori
          <span className="ml-2 font-semibold text-slate-700">
            ({categorizedClusters}/{totalClusters})
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 px-4 py-3">
          {noUnassigned ? "✅" : "❌"} Item belum dipadankan:
          <span className="ml-2 font-semibold text-slate-700">
            {unassignedItems}
          </span>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-slate-600">
          Hanya selepas semua syarat dipenuhi, fasilitator boleh menjana CCPC
          dan meneruskan ke modul seterusnya.
        </div>
      </div>
    </div>
  );
}