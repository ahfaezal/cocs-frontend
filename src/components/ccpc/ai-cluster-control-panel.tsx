import { Sparkles, RefreshCw, GitMerge, RotateCcw, Bot } from "lucide-react";

export function AIClusterControlPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">Kawalan AI Clustering</h2>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Jumlah Kad Input</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">36</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Kad Unik</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">31</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Cluster Dicadangkan</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">5</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Status AI</div>
            <div className="mt-2 text-lg font-bold text-emerald-700">
              Sedia Diproses
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Model / Mode AI
              </label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>OpenAI Semantic Clustering</option>
                <option>OpenAI Merge Suggestion</option>
                <option>Comparison / Similarity Review</option>
              </select>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Bot size={18} className="mt-0.5 text-blue-700" />
                <p className="text-sm leading-6 text-slate-600">
                  AI akan mengelompokkan kad yang hampir sama, mencadangkan nama
                  cluster, dan mengenal pasti item yang bertindih atau belum sesuai
                  diletakkan dalam mana-mana cluster.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
              <Sparkles size={16} />
              Run AI Clustering
            </button>

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 py-3 font-medium text-purple-700 transition hover:bg-purple-50">
              <GitMerge size={16} />
              Apply AI Merge
            </button>

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <RefreshCw size={16} />
              Reload Result
            </button>

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <RotateCcw size={16} />
              Reset Clustering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}