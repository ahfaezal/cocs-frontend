export function ProjectFilterBar() {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          placeholder="Cari projek..."
        />

        <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <option>Status: Semua</option>
        </select>

        <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <option>Tahap: Semua</option>
        </select>

        <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <option>Bidang / Tred: Semua</option>
        </select>

        <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Tapis
        </button>

        <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Reset
        </button>
      </div>
    </div>
  );
}