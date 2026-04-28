"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Info } from "lucide-react";

import { CCPCHeader } from "@/components/ccpc/ccpc-header";
import { CCPCStepProgress } from "@/components/ccpc/ccpc-step-progress";
import { DacumSessionCard } from "@/components/ccpc/dacum-session-card";
import { PanelQRCodeCard } from "@/components/ccpc/panel-qr-card";
import { PanelSubmissionList } from "@/components/ccpc/panel-submission-list";
import { LiveBoardToolbar } from "@/components/ccpc/live-board-toolbar";
import { DacumCardGrid } from "@/components/ccpc/dacum-card-grid";
import { CCPCClusteringSummary } from "@/components/ccpc/CCPCClusteringSummary";
import { CCPCAIClusterList } from "@/components/ccpc/CCPCAIClusterList";
import { CCPCDocumentMode } from "@/components/ccpc/ccpc-document-mode";

import { AIClusterResult } from "@/lib/ccpc-ai-types";
import { API_URL, DEFAULT_SESSION_ID } from "@/lib/env";

function CCPCPageContent() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("projectId") || "";

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [aiClusterResult, setAiClusterResult] =
    useState<AIClusterResult | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null
  );
  const [isRunningClustering, setIsRunningClustering] = useState(false);

  const [projectList, setProjectList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(queryProjectId);

  const [projectInfo, setProjectInfo] = useState({
    title: "Bricklayer (Wet Trade) Level 3",
    code: "COCS/2026/001",
    bidang: "Bricklaying (Wet Trade)",
    tahap: "3",
    status: "draft",
    laluanKerjaya: "Architectural",
  });

  const clusters = aiClusterResult?.clusters ?? [];

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${API_URL}/projects`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Gagal load projects:", await res.text());
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.projects || [];

        setProjectList(list);

        if (!selectedProjectId && list.length > 0) {
          const latestProject = list[list.length - 1];
          setSelectedProjectId(String(latestProject.id));
        }
      } catch (error) {
        console.error("Gagal load senarai projek:", error);
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    async function loadProject() {
      if (!selectedProjectId) return;

      try {
        const res = await fetch(`${API_URL}/projects/${selectedProjectId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Gagal load project:", await res.text());
          return;
        }

        const data = await res.json();

        setProjectInfo({
          title: data.project_title || data.title || "Untitled Project",
          code: data.project_code || data.code || `COCS/${data.id}`,
          bidang: data.field || data.bidang || data.sector || "-",
          tahap: String(data.level || data.tahap || "-"),
          status: data.status || "draft",
          laluanKerjaya:
            data.occupation || data.trade || data.area || data.field || "-",
        });
      } catch (error) {
        console.error("Gagal load project:", error);
      }
    }

    loadProject();
  }, [selectedProjectId]);

  async function handleRunAIClustering() {
    try {
      setIsRunningClustering(true);

      const res = await fetch(`${API_URL}/ccpc/cluster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: DEFAULT_SESSION_ID,
        }),
      });

      if (!res.ok) throw new Error("AI clustering gagal.");

      const result = await res.json();
      const generatedClusters = result.clusters || [];

      setAiClusterResult({
        clusters: generatedClusters,
        unmatchedCards: [],
        totalCards: result.total_items || 0,
        uniqueCards: result.total_items || 0,
        suggestedClusterCount: generatedClusters.length,
        status: "ready",
      });

      setSelectedClusterId(String(generatedClusters?.[0]?.id || ""));
    } catch (error) {
      console.error(error);
      alert("Gagal menjalankan AI clustering.");
    } finally {
      setIsRunningClustering(false);
    }
  }

  const sessionName = projectInfo.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="space-y-6">
      <CCPCHeader
        projectTitle={`${projectInfo.code} – ${projectInfo.title}`}
        status={projectInfo.status}
        bidang={projectInfo.bidang}
        tahap={projectInfo.tahap}
        laluanKerjaya={projectInfo.laluanKerjaya}
        tarikhKemaskini={new Date().toLocaleDateString("ms-MY")}
        jumlahKompetensi={
          clusters.length > 0 ? `${clusters.length} Cluster` : "Belum Dijana"
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>Dashboard</span>
        <ChevronRight size={16} />
        <span>Projek COCS</span>
        <ChevronRight size={16} />
        <span className="font-medium text-slate-700">
          Competency Analysis (CCPC)
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Pilih Projek COCS
        </label>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Sila pilih projek</option>

          {projectList.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {(item.project_code || item.code || `COCS/${item.id}`) +
                " – " +
                (item.project_title || item.title || "Untitled Project")}
            </option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projectList.map((item) => {
            const code = item.project_code || item.code || `COCS/${item.id}`;
            const title =
              item.project_title || item.title || "Untitled Project";
            const isActive = String(selectedProjectId) === String(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedProjectId(String(item.id))}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="font-semibold">{code}</div>
                <div className="mt-1 text-xs">{title}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
            <Info size={20} />
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Competency Analysis (CCPC)
            </h1>

            <p className="mt-1 text-base text-slate-500">
              Bangunkan competency cluster menggunakan DACUM + AI clustering.
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("builder")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              viewMode === "builder"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Builder Mode
          </button>

          <button
            type="button"
            onClick={() => setViewMode("document")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              viewMode === "document"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Document Mode
          </button>
        </div>
      </div>

      {viewMode === "document" ? (
        <CCPCDocumentMode clusters={clusters} />
      ) : (
        <>
          <CCPCStepProgress />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <DacumSessionCard
              sessionName={sessionName}
              standardTitle={projectInfo.title}
            />
            <PanelQRCodeCard />
          </div>

          <PanelSubmissionList />
          <LiveBoardToolbar />
          <DacumCardGrid />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-700">
                  Kawalan AI Clustering
                </h3>

                <p className="text-sm text-slate-500">
                  Jalankan clustering AI berdasarkan DACUM Card.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunAIClustering}
                disabled={isRunningClustering}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isRunningClustering ? "Running AI..." : "Run AI Clustering"}
              </button>
            </div>

            <CCPCClusteringSummary
              result={aiClusterResult}
              isRunning={isRunningClustering}
            />
          </div>

          <CCPCAIClusterList
            clusters={clusters}
            selectedClusterId={selectedClusterId}
            onSelect={setSelectedClusterId}
          />
        </>
      )}
    </div>
  );
}

export default function CCPCPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Memuatkan halaman CCPC...
        </div>
      }
    >
      <CCPCPageContent />
    </Suspense>
  );
}