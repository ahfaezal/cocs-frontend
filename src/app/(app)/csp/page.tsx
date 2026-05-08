"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Eye,
  FileText,
  Info,
  Save,
} from "lucide-react";

import { CSPDocumentHeader } from "@/components/csp/csp-document-header";
import { CSPStructureSidebar } from "@/components/csp/csp-structure-sidebar";
import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/env";

type ProjectInfo = {
  id: string;
  code: string;
  title: string;
  sector: string;
  subsector: string;
  area: string;
  subarea: string;
  level: string;
  status: string;
};

type COSTargetInfo = {
  occupationTitle?: string;
  subarea?: string;
  level?: number;
};

type COSMatrix = {
  subareas: string[];
  levels: Record<number, string[]>;
};

type StoredCluster = {
  id?: string | number;
  clusterName?: string;
  suggestedName?: string;
  name?: string;
  items?: unknown[];
  cards?: unknown[];
  finalised?: boolean;
};

type CompetencySummary = {
  code: string;
  title: string;
  units: {
    code: string;
    title: string;
  }[];
};

const LEVELS = [6, 5, 4, 3, 2, 1];
const ORGANISATION_REFERENCES = [
  {
    name: "Construction Industry Development Board Malaysia (CIDB)",
    lines: [
      "Tingkat 11, CIDB 520",
      "The MET Corporate Towers",
      "No 20 Jalan Dutamas 2",
      "50480 Kuala Lumpur",
      "03-5567 3300",
      "http://www.cidb.gov.my",
      "cidb@cidb.gov.my",
    ],
  },
  {
    name: "Petroliam Nasional Berhad (PETRONAS)",
    lines: [
      "Tower 1, Petronas Towers",
      "50088 Kuala Lumpur",
      "03-2051 5000",
      "https://www.petronas.com",
      "media@petronas.com",
    ],
  },
  {
    name: "Malaysia Marine & Heavy Engineering Holdings Berhad (MMHE)",
    lines: [
      "Level 31, Dayabumi,",
      "Jalan Sultan Hishamuddin, City Centre,",
      "50050 Kuala Lumpur",
      "03-2273 0266",
      "https://mhb.com.my/",
    ],
  },
  {
    name: "Petra Resources Sdn Bhd",
    lines: [
      "4th Floor, Menara OBYU,",
      "4, Jalan PJU 8/8A,",
      "Bandar Damansara Perdana,",
      "47820 Petaling Jaya,",
      "Selangor",
      "03-7726 5576",
      "https://www.petraenergy.com.my",
    ],
  },
];

function formatLevel(level: string) {
  return level && level !== "-" ? `Tahap ${level}` : "-";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function alphabetMarker(index: number) {
  return `${String.fromCharCode(97 + index)})`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function extractClusterItems(cluster: StoredCluster) {
  const rawItems = cluster.items ?? cluster.cards ?? [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") return item;

      if (isRecord(item)) {
        return item.text ?? item.cardText ?? item.title ?? "";
      }

      return "";
    })
    .map(cleanText)
    .filter(Boolean);
}

function extractStoredClusters(payload: unknown) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as StoredCluster[];

  if (isRecord(payload) && Array.isArray(payload.clusters)) {
    return payload.clusters as StoredCluster[];
  }

  return [];
}

function getUsableClusters(clusters: StoredCluster[]) {
  const finalisedClusters = clusters.filter((cluster) => cluster.finalised);
  return finalisedClusters.length > 0 ? finalisedClusters : clusters;
}

function buildCompetencySummaries(
  clusters: StoredCluster[]
): CompetencySummary[] {
  return clusters.map((cluster, clusterIndex) => {
    const code = `CC${pad(clusterIndex + 1)}`;
    const title =
      cleanText(cluster.clusterName) ||
      cleanText(cluster.suggestedName) ||
      cleanText(cluster.name) ||
      `Core Competency ${clusterIndex + 1}`;

    return {
      code,
      title,
      units: extractClusterItems(cluster).map((item, itemIndex) => ({
        code: `${code}-WA${pad(itemIndex + 1)}`,
        title: item,
      })),
    };
  });
}

function CSPDocumentMode({
  projectInfo,
  standardTitle,
  standardLevel,
  careerPath,
  matrix,
  competencies,
}: {
  projectInfo: ProjectInfo;
  standardTitle: string;
  standardLevel: string;
  careerPath: string;
  matrix: COSMatrix | null;
  competencies: CompetencySummary[];
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <section className="min-h-[520px] border border-slate-300 p-8 text-center">
        <div className="text-sm font-semibold text-slate-700">
          Lembaga Pembangunan Industri Pembinaan Malaysia (CIDB)
        </div>

        <div className="mt-20 text-xl font-bold uppercase text-slate-900">
          Construction Occupational Competency Standard
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Standard Kompetensi Pekerjaan Pembinaan
        </div>

        <div className="mt-16 text-sm font-bold text-slate-700">KOD COCS</div>
        <div className="mt-3 text-lg font-bold text-slate-900">
          {projectInfo.code}
        </div>

        <div className="mt-14 text-2xl font-bold uppercase text-slate-900">
          {standardTitle}
        </div>
        <div className="mt-3 text-lg font-semibold uppercase text-slate-700">
          {careerPath}
        </div>
        <div className="mt-10 text-xl font-bold uppercase text-slate-900">
          {formatLevel(standardLevel)}
        </div>
      </section>

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">Maklumat Dokumen</h2>
        <table className="mt-4 w-full border border-black text-sm text-black">
          <tbody>
            <tr>
              <th className="w-48 border border-black bg-slate-200 px-3 py-2 text-left">
                Section
              </th>
              <td className="border border-black px-3 py-2">
                {projectInfo.sector}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                Group
              </th>
              <td className="border border-black px-3 py-2">
                {projectInfo.subsector}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                Area
              </th>
              <td className="border border-black px-3 py-2">
                {projectInfo.area || "-"}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                COCS Title
              </th>
              <td className="border border-black px-3 py-2">{standardTitle}</td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                COCS Level
              </th>
              <td className="border border-black px-3 py-2">
                {formatLevel(standardLevel)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          2.2 Construction Occupational Structure (COS)
        </h2>

        {matrix ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-black text-sm text-black">
              <tbody>
                <tr>
                  <th className="w-36 border border-black bg-slate-200 px-3 py-2 text-left">
                    Sector
                  </th>
                  <td
                    colSpan={matrix.subareas.length}
                    className="border border-black px-3 py-2 text-center font-semibold"
                  >
                    {projectInfo.sector}
                  </td>
                </tr>

                <tr>
                  <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                    Sub Sector
                  </th>
                  <td
                    colSpan={matrix.subareas.length}
                    className="border border-black px-3 py-2 text-center font-semibold"
                  >
                    {projectInfo.subsector}
                  </td>
                </tr>

                <tr>
                  <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                    Area
                  </th>
                  <td
                    colSpan={matrix.subareas.length}
                    className="border border-black px-3 py-2 text-center font-semibold"
                  >
                    {projectInfo.area || "-"}
                  </td>
                </tr>

                <tr>
                  <th className="border border-black bg-slate-200 px-3 py-2 text-left">
                    Subarea
                  </th>
                  {matrix.subareas.map((subarea, index) => (
                    <td
                      key={`csp-doc-subarea-${index}`}
                      className="border border-black px-3 py-2 text-center font-semibold"
                    >
                      {subarea || `Subarea ${index + 1}`}
                    </td>
                  ))}
                </tr>

                {LEVELS.map((level) => (
                  <tr key={`csp-doc-level-${level}`}>
                    <th className="border border-black px-3 py-2 text-left">
                      Level {level}
                    </th>
                    {matrix.levels[level]?.map((value, columnIndex) => (
                      <td
                        key={`csp-doc-level-${level}-${columnIndex}`}
                        className="border border-black px-3 py-2 text-center"
                      >
                        {value || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Struktur COS belum tersedia untuk projek ini.
          </div>
        )}
      </section>

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          4. Occupational Competencies
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          The {standardTitle} {formatLevel(standardLevel)} personnel is
          competent in performing the following core competencies:
        </p>

        {competencies.length > 0 ? (
          <div className="mt-4">
            <div className="space-y-1 text-sm font-semibold leading-6 text-slate-900">
              {competencies.map((competency, competencyIndex) => (
                <div
                  key={`csp-competency-list-${competency.code}`}
                  className="flex gap-3"
                >
                  <span className="w-6 shrink-0">
                    {alphabetMarker(competencyIndex)}
                  </span>
                  <span>
                    {competency.title}
                    {competencyIndex === competencies.length - 2
                      ? "; and"
                      : ";"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Competency belum tersedia. Lengkapkan CCPC dan finalise cluster
            sebelum menjana seksyen ini.
          </div>
        )}
      </section>

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          5. Organisation Reference for Sources of Additional Information
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          The following organisations can be referred as sources of additional
          information which can assist in defining the document&apos;s contents.
        </p>

        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-900">
          {ORGANISATION_REFERENCES.map((organisation, organisationIndex) => (
            <div
              key={`csp-organisation-${organisation.name}`}
              className="flex gap-3"
            >
              <span className="w-6 shrink-0">
                {alphabetMarker(organisationIndex)}
              </span>
              <div>
                <div className="font-semibold">{organisation.name}</div>
                {organisation.lines.map((line, lineIndex) => (
                  <div key={`csp-organisation-${organisation.name}-${lineIndex}`}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CSPPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [targetInfo, setTargetInfo] = useState<COSTargetInfo | null>(null);
  const [matrix, setMatrix] = useState<COSMatrix | null>(null);
  const [clusters, setClusters] = useState<StoredCluster[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    id: "",
    code: "-",
    title: "-",
    sector: "-",
    subsector: "-",
    area: "-",
    subarea: "",
    level: "-",
    status: "draft",
  });

  useEffect(() => {
    if (!projectId) return;

    async function loadCSPBaseData() {
      const token = getAuthToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const projectRes = await fetch(`${API_URL}/projects/${projectId}`, {
          cache: "no-store",
          headers,
        });

        if (projectRes.ok) {
          const data = await projectRes.json();

          setProjectInfo({
            id: String(data.id || projectId),
            code: data.project_code || data.code || `COCS/${data.id}`,
            title: data.project_title || data.title || "-",
            sector: data.sector_name || data.sector || "-",
            subsector: data.subsector_name || data.subsector || "-",
            area: data.area || "-",
            subarea: data.subarea || "",
            level: String(data.level || data.tahap || "-"),
            status: data.status || "draft",
          });
        }

        const cosRes = await fetch(`${API_URL}/cos/structure/${projectId}`, {
          cache: "no-store",
          headers,
        });

        if (cosRes.ok) {
          const data = await cosRes.json();
          setTargetInfo(data.target || null);
          setMatrix(data.matrix || null);
        }
      } catch (error) {
        console.error("Gagal load data asas CSP:", error);
      }
    }

    loadCSPBaseData();
  }, [projectId]);

  const standardTitle = targetInfo?.occupationTitle || projectInfo.title;
  const standardLevel = String(targetInfo?.level || projectInfo.level || "-");
  const sessionName = useMemo(() => {
    if (!projectId || standardTitle === "-") return "";

    return `project-${projectId}-${slugify(
      standardTitle || projectInfo.title || "dacum-session"
    )}`;
  }, [projectId, projectInfo.title, standardTitle]);
  const competencies = useMemo(
    () => buildCompetencySummaries(clusters),
    [clusters]
  );
  const careerPath = useMemo(
    () =>
      targetInfo?.subarea ||
      projectInfo.subarea ||
      projectInfo.area ||
      projectInfo.subsector ||
      "-",
    [projectInfo.area, projectInfo.subarea, projectInfo.subsector, targetInfo]
  );
  const ccpHref = projectId ? `/ccp?projectId=${projectId}` : "/ccp";
  const cccHref = projectId ? `/ccc?projectId=${projectId}` : "/ccc";

  useEffect(() => {
    if (!sessionName) {
      queueMicrotask(() => setClusters([]));
      return;
    }

    async function loadCCPCClusters() {
      try {
        const token = getAuthToken();

        const res = await fetch(`${API_URL}/ccpc/clusters/${sessionName}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          setClusters([]);
          return;
        }

        const payload = await res.json();
        setClusters(getUsableClusters(extractStoredClusters(payload)));
      } catch (error) {
        console.error("Gagal load CCPC clusters untuk CSP:", error);
        setClusters([]);
      }
    }

    loadCCPCClusters();
  }, [sessionName]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Projek:</span>
            <span className="text-2xl font-bold text-blue-700">
              {projectInfo.code} - {standardTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Status:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {projectInfo.status}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Dashboard</span>
          <ChevronRight size={16} />
          <span>Projek COCS</span>
          <ChevronRight size={16} />
          <span className="font-medium text-slate-700">
            Standard Practice (CSP)
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Standard Practice (CSP)
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Lengkapkan kandungan dokumen CSP mengikut struktur Standard
                Practice COCS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <FileText size={16} />
              Salin dari Templat
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <Eye size={16} />
              Pratonton
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
              <Save size={16} />
              Simpan
            </button>
          </div>
        </div>
      </div>

      <CSPDocumentHeader
        bidangPekerjaan={standardTitle}
        tahap={standardLevel}
        laluanKerjaya={careerPath}
        tarikhKemaskini={new Date().toLocaleDateString("ms-MY")}
        versiDokumen="0.1 (Draf)"
      />

      {viewMode === "document" ? (
        <CSPDocumentMode
          projectInfo={projectInfo}
          standardTitle={standardTitle}
          standardLevel={standardLevel}
          careerPath={careerPath}
          matrix={matrix}
          competencies={competencies}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <CSPStructureSidebar />

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-blue-700">
                        1. Pengenalan
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Lengkapkan seksyen pengenalan bagi dokumen CSP.
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      Draf CSP
                    </span>
                  </div>
                </div>

                <div className="space-y-6 px-6 py-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Latar Belakang
                    </label>
                    <textarea
                      className="min-h-[160px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      defaultValue={`Industri pembinaan di Malaysia memainkan peranan penting dalam pembangunan infrastruktur dan kemudahan awam serta swasta. ${standardTitle} merupakan pekerjaan dalam ${projectInfo.subsector} yang memerlukan kompetensi selaras dengan struktur pekerjaan, tahap kemahiran dan keperluan industri.`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Industry Overview
                    </label>
                    <textarea
                      className="min-h-[140px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      defaultValue={`Sektor ${projectInfo.sector} merangkumi bidang ${projectInfo.subsector}. Pembangunan standard bagi ${standardTitle} membantu memastikan tenaga kerja mempunyai pengetahuan, kemahiran dan amalan kerja yang konsisten dengan keperluan semasa industri pembinaan.`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Occupational Definition
                    </label>
                    <textarea
                      className="min-h-[140px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      defaultValue={`${standardTitle} ${formatLevel(standardLevel)} ialah personel yang melaksanakan aktiviti kerja dalam ${careerPath} mengikut prosedur, spesifikasi, keperluan keselamatan dan standard kualiti yang ditetapkan.`}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-xl font-bold text-blue-700">
                    Panduan CSP
                  </h2>
                </div>

                <div className="space-y-3 px-6 py-6 text-sm text-slate-700">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    Lengkapkan setiap seksyen mengikut struktur Standard Practice
                    COCS.
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    Kandungan dalam CSP hendaklah konsisten dengan COS, CCPC dan
                    CCP yang telah disahkan.
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    Gunakan bahasa formal, deskriptif, dan selari dengan
                    keperluan badan kawalselia.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={ccpHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Kembali ke CCP
                </Link>

                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Save size={16} />
                    Simpan Draf
                  </button>

                  <Link
                    href={cccHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Seterusnya: CCC
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="text-sm leading-6 text-slate-700">
              <span className="font-semibold">Nota:</span> Fasa awal CSP memberi
              fokus kepada struktur dokumen dan pengisian kandungan mengikut
              seksyen. Pada langkah seterusnya, kita boleh tambah editor yang
              lebih maju dan integrasi AI untuk membantu cadangan kandungan
              setiap seksyen.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CSPPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Memuatkan halaman CSP...
        </div>
      }
    >
      <CSPPageContent />
    </Suspense>
  );
}
