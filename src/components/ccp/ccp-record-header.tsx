type CCPRecordHeaderProps = {
  section: string;
  group: string;
  area: string;
  cocsTitle: string;
  cocsLevel: string;
  code: string;
  competencyTitle: string;
  competencyCode: string;
};

export function CCPRecordHeader({
  section,
  group,
  area,
  cocsTitle,
  cocsLevel,
  code,
  competencyTitle,
  competencyCode,
}: CCPRecordHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-blue-700">
          Rekod Rasmi Competency Profile (CCP)
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Maklumat di bawah diambil daripada keputusan proses sebelumnya dan
          tidak boleh diubah secara manual.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="w-[220px] bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                SECTION
              </td>
              <td className="px-5 py-4 text-slate-900">{section}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                GROUP
              </td>
              <td className="px-5 py-4 text-slate-900">{group}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                AREA
              </td>
              <td className="px-5 py-4 text-slate-900">{area}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                COCS TITLE
              </td>
              <td className="px-5 py-4 text-slate-900">{cocsTitle}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                COCS LEVEL
              </td>
              <td className="px-5 py-4 text-slate-900">{cocsLevel}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                CODE
              </td>
              <td className="px-5 py-4 text-slate-900">{code}</td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                COMPETENCY TITLE
              </td>
              <td className="px-5 py-4 text-slate-900">{competencyTitle}</td>
            </tr>

            <tr>
              <td className="bg-slate-50 px-5 py-4 font-semibold text-slate-700">
                COMPETENCY CODE
              </td>
              <td className="px-5 py-4 text-slate-900">{competencyCode}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}