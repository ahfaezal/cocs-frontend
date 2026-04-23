type CSPDocumentHeaderProps = {
  bidangPekerjaan: string;
  tahap: string;
  laluanKerjaya: string;
  tarikhKemaskini: string;
  versiDokumen: string;
};

export function CSPDocumentHeader({
  bidangPekerjaan,
  tahap,
  laluanKerjaya,
  tarikhKemaskini,
  versiDokumen,
}: CSPDocumentHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <div className="text-sm text-slate-500">Bidang Pekerjaan</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {bidangPekerjaan}
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
          <div className="text-sm text-slate-500">Versi Dokumen</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {versiDokumen}
          </div>
        </div>
      </div>
    </div>
  );
}