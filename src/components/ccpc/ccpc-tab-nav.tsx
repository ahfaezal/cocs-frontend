type TabKey = "dacum" | "live-board" | "clustering" | "review" | "builder";

const tabs: { key: TabKey; label: string }[] = [
  { key: "dacum", label: "Digital DACUM Card" },
  { key: "live-board", label: "Live Board" },
  { key: "clustering", label: "AI Clustering" },
  { key: "review", label: "Semakan & Finalisasi" },
  { key: "builder", label: "CCPC Builder" },
];

export function CCPCTabNav({
  activeTab,
}: {
  activeTab: TabKey;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}