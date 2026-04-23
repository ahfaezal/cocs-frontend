import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectFilterBar } from "@/components/projects/project-filter-bar";
import { ProjectTable } from "@/components/projects/project-table";
import { mockProjects } from "@/data/mock-projects";

export default function ProjectsPage() {
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

      <div className="mt-2">
        <ProjectTable projects={mockProjects} />
      </div>
    </div>
  );
}