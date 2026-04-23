type CUStatus =
  | "Belum Jana AI"
  | "Work Step Dijana"
  | "PC Dijana"
  | "Lengkap"
  | "Perlu Semakan";

export function CCPCUStatusBadge({ status }: { status: CUStatus }) {
  const styles: Record<CUStatus, string> = {
    "Belum Jana AI": "bg-slate-100 text-slate-700",
    "Work Step Dijana": "bg-blue-100 text-blue-700",
    "PC Dijana": "bg-purple-100 text-purple-700",
    Lengkap: "bg-emerald-100 text-emerald-700",
    "Perlu Semakan": "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}