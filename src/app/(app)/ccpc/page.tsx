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
  const projectId = searchParams.get("projectId");

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [aiClusterResult, setAiClusterResult] =
    useState<AIClusterResult | null>(null);
  const [selectedClusterId, setSelectedClusterId] =
    useState<string | null>(null);
  const [isRunningClustering, setIsRunningClustering] = useState(false);

  const [projectInfo, setProjectInfo] = useState({
    title: "Bricklayer (Wet Trade) Level 3",
    code: "COCS/2024/001",
    bidang: "Bricklaying (Wet Trade)",
    tahap: "3",
    status: "Dalam Pembangunan",
    laluanKerjaya: "Kerja Batu dan Konkrit",
  });

  const clusters = aiClusterResult?.clusters ?? [];

  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      try {
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        setProjectInfo({
          title: data.project_title || data.title || "Untitled Project",
          code: data.project_code || data.code || `COCS/${data.id}`,
          bidang: data.field || data.bidang || data.sector || "-",
          tahap: String(data.level || data.tahap || "-"),
          status: data.status || "Dalam Pembangunan",
          laluanKerjaya:
            data.occupation ||
            data.trade ||
            data.area ||
            data.field ||
            "-",
        });
      } catch (error) {
        console.error("Gagal load project:", error);
      }
    }

    loadProject();
  }, [projectId]);

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

      if (!res.ok) {
        throw new Error("AI clustering gagal.");
      }

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

      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>Dashboard</span>
        <ChevronRight size={16} />
        <span>Projek COCS</span>
        <ChevronRight size={16} />
        <span className="font-medium text-slate-700">
          Competency Analysis (CCPC)
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
            <Info size={20} />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Competency Analysis (CCPC)
            </h1>
            <p className="mt-1 text-base text-slate-500">
              Bangunkan competency cluster menggunakan DACUM + AI clustering.
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("builder")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              viewMode === "builder"
                ? "bg-blue-600 text-white"
                : "text-slate-600"
            }`}
          >
            Builder Mode
          </button>

          <button
            onClick={() => setViewMode("document")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              viewMode === "document"
                ? "bg-blue-600 text-white"
                : "text-slate-600"
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
            <DacumSessionCard />
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
                onClick={handleRunAIClustering}
                disabled={isRunningClustering}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isRunningClustering
                  ? "Running AI..."
                  : "Run AI Clustering"}
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