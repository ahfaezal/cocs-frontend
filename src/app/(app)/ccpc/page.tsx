"use client";

import { useEffect, useState } from "react";
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

export default function CCPCPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [aiClusterResult, setAiClusterResult] =
    useState<AIClusterResult | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null
  );
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
          status: data.status || "Dalam Pembangunan",
          laluanKerjaya:
            data.occupation ||
            data.trade ||
            data.area ||
            data.field ||
            data.bidang ||
            "-",
        });
      } catch (error) {
        console.error("Gagal mendapatkan maklumat projek:", error);
      }
    }

    loadProject();
  }, [projectId]);

  const handleRunAIClustering = async () => {
    try {
      setIsRunningClustering(true);

      const response = await fetch(`${API_URL}/ccpc/cluster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: DEFAULT_SESSION_ID }),
      });

      if (!response.ok) throw new Error("Gagal menjalankan AI clustering");

      const result = await response.json();
      const generatedClusters = result.clusters || [];

      setAiClusterResult({
        clusters: generatedClusters,
        unmatchedCards: [],
        matchedCards:
          generatedClusters.flatMap((cluster: any) => cluster.items || []) ||
          [],
        totalCards: result.total_items ?? 0,
        uniqueCards:
          new Set(
            generatedClusters.flatMap((cluster: any) => cluster.items || []) ||
              []
          ).size ?? 0,
        suggestedClusterCount: result.total_clusters ?? 0,
        status: "ready",
      } as AIClusterResult);

      setSelectedClusterId(String(generatedClusters?.[0]?.id ?? ""));
    } catch (error) {
      console.error(error);
      alert("AI clustering gagal dijalankan. Sila cuba semula.");
    } finally {
      setIsRunningClustering(false);
    }
  };

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

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Dashboard</span>
          <ChevronRight size={16} />
          <span>Projek COCS</span>
          <ChevronRight size={16} />
          <span className="font-medium text-slate-700">
            Competency Analysis (CCPC)
          </span>
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
                Mulakan pembangunan CCPC melalui sesi Digital DACUM Card sebelum
                clustering dan finalisasi kompetensi.
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

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-700">
                  Kawalan AI Clustering
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  AI akan mengelompokkan kad yang hampir sama, mencadangkan nama
                  cluster, dan mengenal pasti item yang belum sesuai diletakkan
                  dalam mana-mana cluster.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunAIClustering}
                disabled={isRunningClustering}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunningClustering ? "Running AI..." : "Run AI Clustering"}
              </button>
            </div>

            <div className="p-4">
              <CCPCClusteringSummary
                result={aiClusterResult}
                isRunning={isRunningClustering}
              />
            </div>
          </div>

          <CCPCAIClusterList
            clusters={clusters}
            selectedClusterId={selectedClusterId}
            onSelect={setSelectedClusterId}
          />

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="text-sm leading-6 text-slate-700">
              <span className="font-semibold">Nota:</span> Semua semakan,
              penambahan cluster, edit DACUM card, dan finalisasi dibuat dalam
              bahagian Senarai Cluster AI sebelum diteruskan ke CCP.
            </div>
          </div>
        </>
      )}
    </div>
  );
}