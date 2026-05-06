"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProjectFilterBar } from "@/components/projects/project-filter-bar";
import { ProjectTable } from "@/components/projects/project-table";
import { PageHeader } from "@/components/shared/page-header";
import { API_URL } from "@/lib/env";
import { hasPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";
import type { ProjectItem, ProjectStatus } from "@/types/project";
import { getAuthToken } from "@/lib/auth";

function normalizeProject(project: any): ProjectItem {
  return {
    id: project.id,
    kodProjek:
      project.kodProjek ||
      project.project_code ||
      project.code ||
      `COCS-${project.id}`,
    tajukProjek:
      project.tajukProjek ||
      project.project_title ||
      project.title ||
      "Untitled Project",
    bidangTred:
      project.subsector_name ||
      project.subsectorName ||
      project.bidangTred ||
      project.bidang ||
      project.field ||
      project.sector ||
      "Belum Ditetapkan",
    sector: project.sector || "",
    sectorName: project.sector_name || project.sectorName || "",
    subsector: project.subsector || "",
    subsectorName: project.subsector_name || project.subsectorName || "",
    area: project.area || "",
    subarea: project.subarea || "",
    tahap: project.tahap || project.level || "-",
    jenis: project.jenis || project.type || "Baharu",
    status: (project.status || "draft") as ProjectStatus,
    progress: Number(project.progress ?? project.kemajuan ?? 0),
    tarikhCipta: project.tarikhCipta || project.created_at || "-",
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentUser = useCurrentUser();
  const canCreateProject = hasPermission(currentUser.role, "project:create");

  async function loadProjects() {
    try {
      setErrorMessage("");

      const token = getAuthToken();

      const res = await fetch(`${API_URL}/projects/`, {
        cache: "no-store",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mendapatkan senarai projek.");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || [];

      setProjects(list.map(normalizeProject));
    } catch (error) {
      console.error("Gagal load projects:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API projek.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUser.id) return;

    loadProjects();
  }, [currentUser.id, currentUser.role]);

  return (
    <div>
      <PageHeader
        title="Projek COCS"
        description="Senarai semua projek pembangunan dan semakan COCS."
        action={
          canCreateProject ? (
            <Link
              href="/projects/new"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Cipta Projek Baru
            </Link>
          ) : null
        }
      />

      <ProjectFilterBar />

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400 shadow-sm">
            Memuatkan senarai projek...
          </div>
        ) : (
          <ProjectTable projects={projects} />
        )}
      </div>
    </div>
  );
}
