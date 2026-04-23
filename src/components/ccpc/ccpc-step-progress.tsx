type StepItem = {
  no: number;
  title: string;
  status: "done" | "active" | "pending";
};

const steps: StepItem[] = [
  { no: 1, title: "Digital DACUM", status: "active" },
  { no: 2, title: "Live Board", status: "pending" },
  { no: 3, title: "AI Clustering", status: "pending" },
  { no: 4, title: "Finalisasi", status: "pending" },
  { no: 5, title: "Generate CCPC", status: "pending" },
];

export function CCPCStepProgress() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {steps.map((step, index) => {
          const tone =
            step.status === "done"
              ? "bg-emerald-600 text-white"
              : step.status === "active"
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-600";

          return (
            <div key={step.no} className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${tone}`}
                >
                  {step.no}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {step.title}
                </div>
              </div>

              {index < steps.length - 1 ? (
                <div className="hidden h-[2px] w-10 bg-slate-200 md:block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}