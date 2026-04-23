"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Info } from "lucide-react";

import { CCPCHeader } from "@/components/ccpc/ccpc-header";
import { CCPCStepProgress } from "@/components/ccpc/ccpc-step-progress";
import { CCPCActionBar } from "@/components/ccpc/ccpc-action-bar";
import { CCPCTabNav } from "@/components/ccpc/ccpc-tab-nav";
import { DacumSessionCard } from "@/components/ccpc/dacum-session-card";
import { PanelQRCodeCard } from "@/components/ccpc/panel-qr-card";
import { PanelSubmissionList } from "@/components/ccpc/panel-submission-list";
import { LiveBoardToolbar } from "@/components/ccpc/live-board-toolbar";
import { DacumCardGrid } from "@/components/ccpc/dacum-card-grid";
import { FinalizationChecklist } from "@/components/ccpc/finalization-checklist";
import { FinalReviewSidebar } from "@/components/ccpc/final-review-sidebar";
import { FinalReviewDetail } from "@/components/ccpc/final-review-detail";
import { CCPCPreviewSummary } from "@/components/ccpc/ccpc-preview-summary";
import { CCPCPreviewList } from "@/components/ccpc/ccpc-preview-list";

import { AIClusterResult, DACUMCard } from "@/lib/ccpc-ai-types";
import { CCPCClusteringSummary } from "@/components/ccpc/CCPCClusteringSummary";
import { CCPCAIClusterList } from "@/components/ccpc/CCPCAIClusterList";
import { CCPCAIClusterDetail } from "@/components/ccpc/CCPCAIClusterDetail";

/**
 * Sementara: mock kad dari Live Board
 * Nanti boleh ganti dengan state sebenar dari DacumCardGrid / store
 */
const liveBoardCards: DACUMCard[] = [
  { id: "1", text: "Ganti imam tidak hadir", panelName: "Panel 1", timestamp: "14:41:48" },
  { id: "2", text: "Sedia jadual tugas bilal", panelName: "Panel 2", timestamp: "14:41:53" },
  { id: "3", text: "Kendali majlis ilmu khas", panelName: "Panel 3", timestamp: "14:41:58" },
  { id: "4", text: "Selaras tugasan jawatankuasa", panelName: "Panel 4", timestamp: "14:42:04" },
  { id: "5", text: "Simpan resit kewangan rasmi", panelName: "Panel 2", timestamp: "14:42:08" },
  { id: "6", text: "Laporkan kerosakan fasiliti masjid", panelName: "Panel 5", timestamp: "14:42:14" },
  { id: "7", text: "Sambut tetamu jemputan rasmi", panelName: "Panel 1", timestamp: "14:42:18" },
  { id: "8", text: "Kemas kini papan kenyataan", panelName: "Panel 3", timestamp: "14:42:23" },
  { id: "9", text: "Pantau perjalanan program masjid", panelName: "Panel 4", timestamp: "14:42:29" },
  { id: "10", text: "Laporkan insiden keselamatan masjid", panelName: "Panel 5", timestamp: "14:42:38" },
  { id: "11", text: "Selaras sukarelawan program masjid", panelName: "Panel 1", timestamp: "14:42:42" },
  { id: "12", text: "Sedia laporan aktiviti tahunan", panelName: "Panel 2", timestamp: "14:42:48" },
  { id: "13", text: "Simpan dokumentasi program masjid", panelName: "Panel 3", timestamp: "14:42:53" },
  { id: "14", text: "Selesai isu kariah setempat", panelName: "Panel 4", timestamp: "14:42:59" },
  { id: "15", text: "Semak keselamatan peralatan masjid", panelName: "Panel 5", timestamp: "14:43:05" },
  { id: "16", text: "Urus penyelenggaraan fasiliti masjid", panelName: "Panel 1", timestamp: "14:43:09" },
];

function mapBoardCardsToDACUMCards(boardCards: DACUMCard[]): DACUMCard[] {
  return boardCards.map((card, index) => ({
    id: card.id ?? `card-${index + 1}`,
    text: card.text ?? "",
    panelName: card.panelName ?? "",
    timestamp: card.timestamp ?? "",
  }));
}

export default function CCPCPage() {
  const [aiClusterResult, setAiClusterResult] = useState<AIClusterResult | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [isRunningClustering, setIsRunningClustering] = useState(false);

  const selectedCluster = useMemo(() => {
    return (
      aiClusterResult?.clusters.find((cluster) => cluster.id === selectedClusterId) ??
      null
    );
  }, [aiClusterResult, selectedClusterId]);

  const handleRunAIClustering = async () => {
    try {
      setIsRunningClustering(true);

      const cardsPayload = mapBoardCardsToDACUMCards(liveBoardCards).filter(
        (card) => card.text.trim().length > 0
      );

      const response = await fetch("/api/ccpc/cluster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cards: cardsPayload }),
      });

      if (!response.ok) {
        throw new Error("Gagal menjalankan AI clustering");
      }

      const result: AIClusterResult = await response.json();

      setAiClusterResult(result);
      setSelectedClusterId(result.clusters[0]?.id ?? null);
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
        projectTitle="COCS/2024/001 – Bricklayer (Wet Trade) Level 3"
        status="Dalam Pembangunan"
        bidang="Bricklaying (Wet Trade)"
        tahap="3"
        laluanKerjaya="Kerja Batu dan Konkrit"
        tarikhKemaskini="20 Mei 2024"
        jumlahKompetensi="Belum Dijana"
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
      </div>

      <CCPCStepProgress />
      <CCPCActionBar />
      <CCPCTabNav activeTab="dacum" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DacumSessionCard />
        <PanelQRCodeCard />
      </div>

      <PanelSubmissionList />

      <LiveBoardToolbar />
      <DacumCardGrid />

      {/* AI Clustering Section */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-700">Kawalan AI Clustering</h3>
              <p className="mt-1 text-sm text-slate-500">
                AI akan mengelompokkan kad yang hampir sama, mencadangkan nama cluster,
                dan mengenal pasti item yang belum sesuai diletakkan dalam mana-mana cluster.
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            <CCPCAIClusterList
              clusters={aiClusterResult?.clusters ?? []}
              selectedClusterId={selectedClusterId}
              onSelect={setSelectedClusterId}
            />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-bold text-blue-700">Item Belum Dipadankan</h3>
              </div>

              <div className="space-y-2 p-4">
                {(aiClusterResult?.unmatchedCards ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Tiada item belum dipadankan.
                  </p>
                ) : (
                  aiClusterResult?.unmatchedCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {card.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <CCPCAIClusterDetail cluster={selectedCluster} />
        </div>
      </div>

      <FinalizationChecklist
        totalClusters={aiClusterResult?.suggestedClusterCount ?? 5}
        approvedClusters={2}
        categorizedClusters={aiClusterResult?.clusters.length ?? 5}
        unassignedItems={aiClusterResult?.unmatchedCards.length ?? 4}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <FinalReviewSidebar />
        <FinalReviewDetail />
      </div>

      <CCPCPreviewSummary
        totalCompetencies={3}
        coreCount={2}
        electiveCount={1}
        totalCU={7}
      />

      <CCPCPreviewList />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="text-sm leading-6 text-slate-700">
          <span className="font-semibold">Nota:</span> Fasilitator tidak boleh
          meneruskan ke CCP sebelum proses Digital DACUM, AI Clustering,
          semakan, finalisasi, dan penjanaan CCPC diselesaikan.
        </div>
      </div>
    </div>
  );
}