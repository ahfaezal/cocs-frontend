"use client";

import Link from "next/link";
import { Eye, Pencil, MoreVertical, Trash2 } from "lucide-react";
import { ProjectItem } from "@/types/project";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { API_URL } from "@/lib/env";

export function ProjectTable({ projects }: { projects: ProjectItem[] }) {
  async function handleDelete(project: ProjectItem) {
    const confirmDelete = window.confirm(
      `Padam projek "${project.tajukProjek}"?\n\nTindakan ini tidak boleh dibatalkan.`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/projects/${project.id}`, {
        method: "DELETE",
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
              projects.map((item, index) => (
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
                    {item.bidangTred}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    Tahap {item.tahap}
                  </td>

                  <td className="px-4 py-4 text-slate-700">{item.jenis}</td>

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
                      <Link
                        href={`/ccpc?projectId=${item.id}`}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                        title="Buka CCPC projek"
                      >
                        <Eye size={16} />
                      </Link>

                      <Link
                        href={`/ccpc?projectId=${item.id}`}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                        title="Sambung pembangunan projek"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        title="Padam projek"
                      >
                        <Trash2 size={16} />
                      </button>

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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}