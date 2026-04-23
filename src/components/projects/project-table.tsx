import { Eye, Pencil, MoreVertical } from "lucide-react";
import { ProjectItem } from "@/types/project";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";

export function ProjectTable({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-4">No.</th>
              <th className="px-4 py-4">Kod Projek</th>
              <th className="px-4 py-4">Tajuk Projek</th>
              <th className="px-4 py-4">Bidang / Tred</th>
              <th className="px-4 py-4">Tahap</th>
              <th className="px-4 py-4">Jenis</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Progress</th>
              <th className="px-4 py-4">Tarikh Cipta</th>
              <th className="px-4 py-4 text-center">Tindakan</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="px-4 py-4">{index + 1}</td>

                <td className="px-4 py-4 font-medium text-slate-800">
                  {item.kodProjek}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {item.tajukProjek}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {item.bidangTred}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  Tahap {item.tahap}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {item.jenis}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>

                <td className="px-4 py-4">
                  <ProgressBar value={item.progress} />
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {item.tarikhCipta}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100">
                      <Eye size={16} />
                    </button>

                    <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100">
                      <Pencil size={16} />
                    </button>

                    <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}