"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ProjectFilterBar } from "@/components/projects/project-filter-bar";
import { ProjectTable } from "@/components/projects/project-table";
import { API_URL } from "@/lib/env";
import type { ProjectStatus } from "@/types/project";

type ProjectItem = {
  id: number | string;
  kodProjek?: string;
  project_code?: string;
  code?: string;
  tajukProjek?: string;
  title?: string;
  project_title?: string;
  bidang?: string;
  field?: string;
  sector?: string;
  tahap?: string | number;
  level?: string | number;
  jenis?: string;
  type?: string;
  status?: string;
  progress?: number;
  kemajuan?: number;
  tarikhCipta?: string;
  created_at?: string;
};

function normalizeProject(project: ProjectItem) {
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
    bidang:
      project.bidang ||
      project.field ||
      project.sector ||
      "Belum Ditetapkan",
    tahap: project.tahap || project.level || "-",
    jenis: project.jenis || project.type || "Baru",
    status: (project.status || "Dalam Pembangunan") as ProjectStatus,
    progress: Number(project.progress ?? project.kemajuan ?? 0),
    tarikhCipta:
      project.tarikhCipta ||
      project.created_at ||
      "-",
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ReturnType<typeof normalizeProject>[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProjects() {
    try {
      setErrorMessage("");

      const res = await fetch(`${API_URL}/projects`, {
        cache: "no-store",
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
    loadProjects();
  }, []);

  return (
    <div>
      <PageHeader
        title="Projek COCS"
        description="Senarai semua projek pembangunan dan semakan COCS."
        action={
          <Link
            href="/projects/new"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Cipta Projek Baru
          </Link>
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