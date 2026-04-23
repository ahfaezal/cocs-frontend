type CCPCHeaderProps = {
  projectTitle: string;
  status: string;
  bidang: string;
  tahap: string;
  laluanKerjaya: string;
  tarikhKemaskini: string;
  jumlahKompetensi: string;
};

export function CCPCHeader({
  projectTitle,
  status,
  bidang,
  tahap,
  laluanKerjaya,
  tarikhKemaskini,
  jumlahKompetensi,
}: CCPCHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Projek:</span>
            <span className="text-2xl font-bold text-blue-700">
              {projectTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Status:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <div className="text-sm text-slate-500">Bidang Pekerjaan</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {bidang}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Tahap</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {tahap}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Laluan Kerjaya</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {laluanKerjaya}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Tarikh Kemaskini</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {tarikhKemaskini}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Status CCPC</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {jumlahKompetensi}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}