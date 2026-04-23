type StepItem = {
  no: number;
  title: string;
  desc: string;
};

const steps: StepItem[] = [
  { no: 1, title: "Maklumat Projek", desc: "Maklumat asas projek" },
  { no: 2, title: "Justifikasi", desc: "Sebab pembangunan projek" },
  { no: 3, title: "Skop & Tahap", desc: "Tahap dan skop pembangunan" },
  { no: 4, title: "Maklumat Pemohon", desc: "Organisasi & hubungan" },
  { no: 5, title: "Semakan", desc: "Semak maklumat sebelum simpan" },
];

export function ProjectFormStepper({
  currentStep = 1,
}: {
  currentStep?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {steps.map((step) => {
          const isActive = step.no === currentStep;
          const isCompleted = step.no < currentStep;

          return (
            <div
              key={step.no}
              className={`flex gap-4 px-5 py-5 ${
                isActive ? "bg-blue-50/60" : "bg-white"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.no}
              </div>

              <div className="min-w-0">
                <div
                  className={`font-semibold ${
                    isActive ? "text-blue-700" : "text-slate-900"
                  }`}
                >
                  {step.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}