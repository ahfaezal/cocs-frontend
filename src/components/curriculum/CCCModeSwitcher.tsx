"use client";

type CCCMode = "builder" | "document";

interface CCCModeSwitcherProps {
  mode: CCCMode;
  onChange: (mode: CCCMode) => void;
}

export function CCCModeSwitcher({ mode, onChange }: CCCModeSwitcherProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        onClick={() => onChange("builder")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          mode === "builder"
            ? "bg-emerald-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Builder Mode
      </button>

      <button
        onClick={() => onChange("document")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          mode === "document"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Document Mode
      </button>
    </div>
  );
}