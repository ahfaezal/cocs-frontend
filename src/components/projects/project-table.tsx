"use client";

import Link from "next/link";
import { Eye, Pencil, MoreVertical, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/env";
import { hasPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";
import type { ProjectItem } from "@/types/project";

export function ProjectTable({ projects }: { projects: ProjectItem[] }) {
  const currentUser = useCurrentUser();

  const canEditProject = hasPermission(
    currentUser.role,
    "content:update_assigned"
  );

  const canDeleteProject = hasPermission(currentUser.role, "project:delete");

  async function handleDelete(project: ProjectItem) {
    if (!canDeleteProject) {
      alert("Anda tidak mempunyai kebenaran untuk memadam projek.");
      return;
    }

    const confirmDelete = window.confirm(
      `Padam projek "${project.tajukProjek}"?\n\nTindakan ini tidak boleh dibatalkan.`
    );

    if (!confirmDelete) return;

    try {
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/projects/${project.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal memadam projek.");
      }

      window.location.reload();
    } catch (error) {
      console.error("Gagal delete projek:", error);
      alert("Gagal memadam projek. Sila semak API backend.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-4">No.</th>
              <th className="px-4 py-4">Kod Projek</th>
              <th className="px-4 py-4">Tajuk Projek</th>
              <th className="px-4 py-4">Sektor</th>
              <th className="px-4 py-4">Subsektor MSIC</th>
              <th className="px-4 py-4">Area / Subarea</th>
              <th className="px-4 py-4">Tahap</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Progress</th>
              <th className="px-4 py-4 text-center">Tindakan</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Tiada projek dijumpai.
                </td>
              </tr>
            ) : (
              projects.map((item, index) => {
                const sectorLabel = item.sectorName || item.sector || "-";

                const subsectorLabel =
                  item.subsectorName || item.bidangTred || item.subsector || "-";

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">{index + 1}</td>

                    <td className="px-4 py-4 font-medium text-slate-800">
                      {item.kodProjek}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {item.tajukProjek}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {sectorLabel}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {subsectorLabel}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      <div>{item.area || "-"}</div>
                      {item.subarea ? (
                        <div className="mt-1 text-xs text-slate-500">
                          {item.subarea}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      Tahap {item.tahap}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-4 py-4">
                      <ProgressBar value={item.progress} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/cos?projectId=${item.id}`}
                          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                          title="Buka COS projek"
                        >
                          <Eye size={16} />
                        </Link>

                        {canEditProject ? (
                          <Link
                            href={`/cos?projectId=${item.id}`}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                            title="Sambung pembangunan projek dari COS"
                          >
                            <Pencil size={16} />
                          </Link>
                        ) : null}

                        {canDeleteProject ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Padam projek"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                          title="Lagi tindakan"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
