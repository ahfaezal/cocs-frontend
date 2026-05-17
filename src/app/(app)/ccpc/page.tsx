"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Info, Sparkles } from "lucide-react";

import { CCPCHeader } from "@/components/ccpc/ccpc-header";
import { CCPCStepProgress } from "@/components/ccpc/ccpc-step-progress";
import { DacumSessionCard } from "@/components/ccpc/dacum-session-card";
import { PanelQRCodeCard } from "@/components/ccpc/panel-qr-card";
import { PanelSubmissionList } from "@/components/ccpc/panel-submission-list";
import { LiveBoardToolbar } from "@/components/ccpc/live-board-toolbar";
import { CCPCClusteringSummary } from "@/components/ccpc/CCPCClusteringSummary";
import { CCPCAIClusterList } from "@/components/ccpc/CCPCAIClusterList";
import { CCPCDocumentMode } from "@/components/ccpc/ccpc-document-mode";
import { PermissionGuard } from "@/components/shared/permission-guard";

import { AIClusterResult } from "@/lib/ccpc-ai-types";
import { API_URL } from "@/lib/env";
import { getAuthToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/use-current-user";

type SessionStatus = "draft" | "active" | "closed";

type COSTargetInfo = {
  occupationTitle?: string;
  subarea?: string;
  level?: number;
};

type COSDevelopmentTarget = {
  level: number;
  columnIndex: number;
  occupationTitle?: string;
  subarea?: string;
};

type COSMatrixInfo = {
  selectedDevelopmentLevels?: number[];
  selectedDevelopmentTargets?: COSDevelopmentTarget[];
};

type CCPCSummaryCluster = AIClusterResult["clusters"][number] & {
  id?: string | number;
  clusterName?: string;
  items?: string[];
  workStepsMap?: Record<string, string[]>;
  notes?: string;
  target?: {
    occupationTitle?: string;
    level?: string | number;
    subarea?: string;
  };
};

type CCPCTargetGroup = {
  key: string;
  label: string;
  target: {
    occupationTitle?: string;
    level?: string | number;
    subarea?: string;
  };
  clusters: CCPCSummaryCluster[];
};

type CCPCPackage = {
  packageId?: string;
  packageName: string;
  includedTargets: Array<Record<string, unknown>>;
  consolidatedClusters: CCPCSummaryCluster[];
  mode?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toAIClusterResult(clusters: AIClusterResult["clusters"]): AIClusterResult {
  const totalCards = clusters.reduce((total, cluster) => {
    const items = (cluster as CCPCSummaryCluster).items || [];
    return total + items.length;
  }, 0);

  return {
    clusters,
    unmatchedCards: [],
    totalCards,
    uniqueCards: totalCards,
    suggestedClusterCount: clusters.length,
    status: "ready",
  };
}

function CCPCSummaryMode({
  clusters,
}: {
  clusters: AIClusterResult["clusters"];
}) {
  const summaryClusters = clusters as CCPCSummaryCluster[];
  const groupedClusters = summaryClusters.reduce<
    Record<string, { label: string; clusters: CCPCSummaryCluster[] }>
  >((acc, cluster) => {
    const target = cluster.target || {};
    const label = target.occupationTitle
      ? `Level ${target.level || "-"} - ${target.occupationTitle}`
      : "CCPC";

    if (!acc[label]) {
      acc[label] = { label, clusters: [] };
    }

    acc[label].clusters.push(cluster);
    return acc;
  }, {});
  const clusterGroups = Object.values(groupedClusters);

  if (summaryClusters.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-800">
        Tiada hasil clustering untuk dipaparkan. Jalankan AI Clustering dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {clusterGroups.map((group) => (
        <div key={group.label} className="space-y-5">
          {clusterGroups.length > 1 ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-800">
              {group.label}
            </div>
          ) : null}

      {group.clusters.map((cluster, clusterIndex) => {
        const ccCode = `CC${pad2(clusterIndex + 1)}`;
        const units = cluster.items || [];

        return (
          <div
            key={cluster.id || ccCode}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <div className="text-xs font-bold text-blue-700">{ccCode}</div>
              <h3 className="text-xl font-bold text-slate-900">
                {cluster.clusterName || `Core Competency ${clusterIndex + 1}`}
              </h3>

              {cluster.notes ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {cluster.notes}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              {units.map((unitTitle, unitIndex) => {
                const waCode = `${ccCode}-WA${pad2(unitIndex + 1)}`;
                const workSteps = cluster.workStepsMap?.[unitTitle] || [];

                return (
                  <div
                    key={`${ccCode}-${unitIndex}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-blue-700">
                          {waCode}
                        </div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {unitTitle}
                        </div>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                        {workSteps.length} WS
                      </span>
                    </div>

                    {workSteps.length > 0 ? (
                      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                        {workSteps.map((step, stepIndex) => (
                          <li key={`${waCode}-ws-${stepIndex}`}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-400">
                        Belum ada WS ringkasan untuk CU ini.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
        </div>
      ))}
    </div>
  );
}

function groupClustersForPackaging(clusters: AIClusterResult["clusters"]) {
  const summaryClusters = clusters as CCPCSummaryCluster[];
  const groups = new Map<string, CCPCTargetGroup>();

  summaryClusters.forEach((cluster) => {
    const target = cluster.target || {};
    const key = `${target.level || "-"}-${target.occupationTitle || "CCPC"}`;
    const label = target.occupationTitle
      ? `Level ${target.level || "-"} - ${target.occupationTitle}`
      : "CCPC";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label,
        target,
        clusters: [],
      });
    }

    groups.get(key)?.clusters.push(cluster);
  });

  return Array.from(groups.values());
}

function CCPCPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const currentUser = useCurrentUser();

  const canManageContent =
    hasPermission(currentUser.role, "content:update_assigned") ||
    hasPermission(currentUser.role, "project:create");

  const [viewMode, setViewMode] =
    useState<"builder" | "summary" | "document">("builder");
  const [aiClusterResult, setAiClusterResult] =
    useState<AIClusterResult | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null
  );
  const [isRunningClustering, setIsRunningClustering] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [selectedPackageKeys, setSelectedPackageKeys] = useState<string[]>([]);
  const [packageName, setPackageName] = useState("");
  const [ccpcPackages, setCCPCPackages] = useState<CCPCPackage[]>([]);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("draft");
  const [targetInfo, setTargetInfo] = useState<COSTargetInfo | null>(null);
  const [cosMatrixInfo, setCOSMatrixInfo] = useState<COSMatrixInfo | null>(null);

  const [projectInfo, setProjectInfo] = useState({
    title: "-",
    code: "-",
    sector: "-",
    bidang: "-",
    tahap: "-",
    status: "draft",
    laluanKerjaya: "-",
  });

  const clusters = aiClusterResult?.clusters ?? [];
  const targetGroups = useMemo(() => groupClustersForPackaging(clusters), [clusters]);

  useEffect(() => {
    if (!projectId) return;

    async function loadCOSTarget() {
      try {
        const token = getAuthToken();

        const res = await fetch(`${API_URL}/cos/structure/${projectId}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          setTargetInfo(null);
          return;
        }

        const data = await res.json();
        setTargetInfo(data.target || null);
        setCOSMatrixInfo(data.matrix || null);
      } catch (error) {
        console.error("Gagal load target COS dari backend:", error);
        setTargetInfo(null);
        setCOSMatrixInfo(null);
      }
    }

    const timer = window.setTimeout(() => {
      loadCOSTarget();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [projectId]);

  const standardTitle = targetInfo?.occupationTitle || projectInfo.title;
  const selectedDevelopmentTargets =
    cosMatrixInfo?.selectedDevelopmentTargets ?? [];
  const selectedDevelopmentLevels = Array.from(
    new Set(
      selectedDevelopmentTargets.length > 0
        ? selectedDevelopmentTargets.map((target) => target.level)
        : cosMatrixInfo?.selectedDevelopmentLevels ?? []
    )
  ).sort((a, b) => a - b);
  const developmentLevelLabel =
    selectedDevelopmentLevels.length > 0
      ? selectedDevelopmentLevels.map((level) => `Level ${level}`).join(", ")
      : projectInfo.tahap;
  const selectedOccupationLabel =
    selectedDevelopmentTargets.length > 0
      ? selectedDevelopmentTargets
          .map((target) => target.occupationTitle)
          .filter(Boolean)
          .join(", ")
      : standardTitle;

  const sessionName = useMemo(() => {
    const slug = slugify(standardTitle || projectInfo.title || "dacum-session");
    return projectId ? `project-${projectId}-${slug}` : slug;
  }, [projectId, projectInfo.title, standardTitle]);

  const cosHref = projectId ? `/cos?projectId=${projectId}` : "/cos";

  useEffect(() => {
    if (!sessionName) return;

    async function loadCCPCClusters() {
      try {
        const res = await fetch(`${API_URL}/ccpc/clusters/${sessionName}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setAiClusterResult(null);
          setSelectedClusterId(null);
          return;
        }

        const data = await res.json();
        const backendClusters = Array.isArray(data) ? data : data.clusters || [];

        if (backendClusters.length === 0) {
          setAiClusterResult(null);
          setSelectedClusterId(null);
          return;
        }

        setAiClusterResult(toAIClusterResult(backendClusters));
        setSelectedClusterId(String(backendClusters?.[0]?.id || ""));
      } catch (error) {
        console.error("Gagal load CCPC clusters dari backend:", error);
        setAiClusterResult(null);
        setSelectedClusterId(null);
      }
    }

    const timer = window.setTimeout(() => {
      loadCCPCClusters();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [sessionName]);

  useEffect(() => {
    if (!sessionName) return;

    async function loadPackages() {
      try {
        const res = await fetch(`${API_URL}/ccpc/packages/${sessionName}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setCCPCPackages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal load CCPC packages:", error);
      }
    }

    loadPackages();
  }, [sessionName]);

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        const token = getAuthToken();

        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          console.error("Gagal load project:", await res.text());
          return;
        }

        const data = await res.json();

        setProjectInfo({
          title: data.project_title || data.title || "Untitled Project",
          code: data.project_code || data.code || `COCS/${data.id}`,
          sector: data.sector_name || data.sector || "-",
          bidang:
            data.subsector_name ||
            data.subsector ||
            data.field ||
            data.bidang ||
            data.sector_name ||
            data.sector ||
            "-",
          tahap: String(targetInfo?.level || data.level || data.tahap || "-"),
          status: data.status || "draft",
          laluanKerjaya:
            targetInfo?.subarea ||
            data.area ||
            data.occupation ||
            data.trade ||
            "-",
        });
      } catch (error) {
        console.error("Gagal load project:", error);
      }
    }

    loadProject();
  }, [projectId, targetInfo?.level, targetInfo?.subarea]);

  function updateSessionStatus(nextStatus: SessionStatus) {
    if (!projectId) return;
    setSessionStatus(nextStatus);
  }

  function persistAIClusterResult(nextResult: AIClusterResult | null) {
    setAiClusterResult(nextResult);
  }

  function handleClusterListChange(nextClusters: AIClusterResult["clusters"]) {
    window.setTimeout(() => {
      setAiClusterResult((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          clusters: nextClusters,
          suggestedClusterCount: nextClusters.length,
        };
      });
    }, 0);
  }

  function handleActivateSession() {
    if (!canManageContent) return;
    updateSessionStatus("active");
  }

  function handleCloseSession() {
    if (!canManageContent) return;

    const confirmed = window.confirm(
      "Tutup sesi DACUM? Panel tidak lagi boleh menggunakan QR aktif untuk menghantar input."
    );

    if (!confirmed) return;
    updateSessionStatus("closed");
  }

  async function handleRunAIClustering() {
    if (!canManageContent) return;

    if (sessionStatus !== "active") {
      alert("Aktifkan sesi DACUM dahulu sebelum menjalankan AI clustering.");
      return;
    }

    try {
      setIsRunningClustering(true);

      const res = await fetch(`${API_URL}/ccpc/cluster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionName,
          project_id: projectId,
        }),
      });

      if (!res.ok) throw new Error("AI clustering gagal.");

      const result = await res.json();

      if (result.success === false) {
        throw new Error(result.message || "AI clustering gagal.");
      }

      const generatedClusters = result.clusters || [];

      const nextResult: AIClusterResult = {
        clusters: generatedClusters,
        unmatchedCards: [],
        totalCards: result.total_items || 0,
        uniqueCards: result.total_items || 0,
        suggestedClusterCount: generatedClusters.length,
        status: "ready",
      };

      persistAIClusterResult(nextResult);
      setSelectedClusterId(String(generatedClusters?.[0]?.id || ""));
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menjalankan AI clustering."
      );
    } finally {
      setIsRunningClustering(false);
    }
  }

  function togglePackageTarget(key: string) {
    setSelectedPackageKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  async function handleConsolidatePackage() {
    if (!canManageContent || selectedPackageKeys.length < 2) {
      alert("Pilih sekurang-kurangnya dua level/jawatan untuk digabungkan.");
      return;
    }

    const selectedGroups = targetGroups.filter((group) =>
      selectedPackageKeys.includes(group.key)
    );
    const finalPackageName =
      packageName.trim() ||
      selectedGroups.map((group) => group.label).join(" + ");

    try {
      setIsConsolidating(true);

      const res = await fetch(
        `${API_URL}/ccpc/packages/${sessionName}/consolidate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            package_name: finalPackageName,
            included_targets: selectedGroups.map((group) => group.target),
            source_clusters: selectedGroups.flatMap((group) => group.clusters),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("AI gabungan gagal dijalankan.");
      }

      const data = await res.json();

      if (data.success === false) {
        throw new Error(data.message || "AI gabungan gagal dijalankan.");
      }

      setCCPCPackages((prev) => [...prev, data.package]);
      setSelectedPackageKeys([]);
      setPackageName("");
    } catch (error) {
      console.error("Gagal consolidate CCPC package:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menjalankan AI gabungan dokumen."
      );
    } finally {
      setIsConsolidating(false);
    }
  }

  if (!projectId) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-800">
          Sila pilih projek daripada Senarai Projek COCS terlebih dahulu.
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Pergi ke Senarai Projek
        </Link>
      </div>
    );
  }

  return (
    <PermissionGuard
      permissions={["content:view_all", "content:view_assigned"]}
      fallbackMessage="Anda tidak mempunyai kebenaran untuk membuka modul CCPC."
    >
      <div className="space-y-6">
        <CCPCHeader
          projectTitle={`${projectInfo.code} - ${standardTitle}`}
          status={projectInfo.status}
          bidang={projectInfo.bidang}
          tahap={developmentLevelLabel}
          laluanKerjaya={projectInfo.laluanKerjaya}
          tarikhKemaskini={new Date().toLocaleDateString("ms-MY")}
          jumlahKompetensi={
            clusters.length > 0 ? `${clusters.length} Cluster` : "Belum Dijana"
          }
        />

        {selectedDevelopmentLevels.length > 0 ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
            <span className="font-bold">Skop tahap pembangunan:</span>{" "}
            {developmentLevelLabel}.
            {selectedDevelopmentTargets.length > 0 ? (
              <>
                {" "}
                <span className="font-bold">Jawatan dipilih:</span>{" "}
                {selectedOccupationLabel}.
              </>
            ) : null}{" "}
            AI clustering akan mengambil kira pilihan ini semasa membina CCPC.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
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

            <button
              type="button"
              onClick={() => setViewMode("summary")}
              className={`rounded-lg px-5 py-2 text-sm font-semibold ${
                viewMode === "summary"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Summary Mode
            </button>
          </div>
        </div>

        {viewMode === "document" ? (
          <CCPCDocumentMode
            clusters={clusters}
            section={projectInfo.sector}
            group={projectInfo.bidang}
            area={projectInfo.laluanKerjaya}
            cocsTitle={standardTitle}
            cocsLevel={projectInfo.tahap}
            cocsCode={projectInfo.code}
          />
        ) : viewMode === "summary" ? (
          <CCPCSummaryMode clusters={clusters} />
        ) : (
          <>
            <CCPCStepProgress />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <DacumSessionCard
                standardTitle={standardTitle}
                readOnly={!canManageContent}
                sessionId={sessionName}
                refreshActive={sessionStatus === "active"}
                sessionStatus={sessionStatus}
                onActivateSession={handleActivateSession}
                onCloseSession={handleCloseSession}
              />

              <PanelQRCodeCard
                readOnly={!canManageContent}
                sessionId={sessionName}
                sessionActive={sessionStatus === "active"}
                sessionClosed={sessionStatus === "closed"}
              />
            </div>

            <PanelSubmissionList
              sessionId={sessionName}
              refreshActive={sessionStatus === "active"}
              sessionActive={sessionStatus !== "draft"}
            />

            {sessionStatus === "active" ? (
              <LiveBoardToolbar
                readOnly={!canManageContent}
                sessionId={sessionName}
                projectId={projectId}
              />
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-700">
                    Kawalan AI Clustering
                  </h3>

                  <p className="text-sm text-slate-500">
                    {canManageContent
                      ? "Jalankan clustering AI berdasarkan DACUM Card."
                      : "Pegawai Penilai hanya boleh melihat hasil clustering."}
                  </p>
                </div>

                {canManageContent ? (
                  <button
                    type="button"
                    onClick={handleRunAIClustering}
                    disabled={isRunningClustering || sessionStatus !== "active"}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isRunningClustering
                      ? "Running AI..."
                      : "Run AI Clustering"}
                  </button>
                ) : null}
              </div>

              <CCPCClusteringSummary
                result={aiClusterResult}
                isRunning={isRunningClustering}
                sessionId={sessionName}
                refreshActive={sessionStatus === "active"}
                sessionActive={sessionStatus !== "draft"}
              />
            </div>

            {targetGroups.length > 1 ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-lg font-bold text-blue-700">
                    Tetapan Gabungan Dokumen
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Pilih dua atau lebih level/jawatan untuk AI susun semula
                    menjadi satu pakej CCPC tanpa menghapuskan hasil asal.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <input
                    value={packageName}
                    onChange={(event) => setPackageName(event.target.value)}
                    placeholder="Contoh: Railway Track Installation Level 1-3"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {targetGroups.map((group) => (
                      <label
                        key={group.key}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedPackageKeys.includes(group.key)
                            ? "border-blue-300 bg-blue-50 text-blue-800"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPackageKeys.includes(group.key)}
                          onChange={() => togglePackageTarget(group.key)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        {group.label}
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      {ccpcPackages.length > 0
                        ? `${ccpcPackages.length} pakej gabungan telah dijana.`
                        : "Belum ada pakej gabungan dijana."}
                    </p>

                    <button
                      type="button"
                      onClick={handleConsolidatePackage}
                      disabled={isConsolidating || selectedPackageKeys.length < 2}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Sparkles size={16} />
                      {isConsolidating
                        ? "Menyusun..."
                        : "AI Susun Semula Gabungan"}
                    </button>
                  </div>

                  {ccpcPackages.length > 0 ? (
                    <div className="space-y-2">
                      {ccpcPackages.map((item) => (
                        <div
                          key={item.packageId || item.packageName}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        >
                          <span className="font-bold">{item.packageName}</span>{" "}
                          ({item.consolidatedClusters?.length || 0} Core
                          Competency)
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <CCPCAIClusterList
              clusters={clusters}
              selectedClusterId={selectedClusterId}
              onSelect={setSelectedClusterId}
              readOnly={!canManageContent}
              proceedHref={`/ccp?projectId=${projectId}`}
              sessionId={sessionName}
              onClustersChange={handleClusterListChange}
            />
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={cosHref}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Kembali ke COS
          </Link>
        </div>
      </div>
    </PermissionGuard>
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
