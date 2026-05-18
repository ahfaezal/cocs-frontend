"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import { getAuthToken } from "@/lib/auth";
import { API_URL } from "@/lib/env";

type ProjectInfo = {
  id: string;
  code: string;
  title: string;
  sector: string;
  group: string;
  area: string;
  subarea: string;
  level: string;
  status: string;
};

type CompetencyUnit = {
  competencyCode: string;
  competencyTitle: string;
  unitCode: string;
  unitTitle: string;
};

type Competency = {
  code: string;
  title: string;
  units: CompetencyUnit[];
};

type CCPUnitProfile = {
  workSteps: string[];
  performanceCriteria: string[];
  generatedAt?: string;
  savedAt?: string;
};

type CCPCompetencyProfile = {
  descriptor: string;
  units: Record<string, CCPUnitProfile>;
  generatedAt?: string;
  savedAt?: string;
};

type CCPProfiles = Record<string, CCPCompetencyProfile>;

type CCCUnitProfile = {
  knowledge: string[];
  attitude: string[];
  safety: string[];
  environment: string[];
  generatedAt?: string;
  savedAt?: string;
};

type CCCCompetencyProfile = {
  learningOutcomeIntro: string;
  trainingPrerequisite: string;
  units: Record<string, CCCUnitProfile>;
  generatedAt?: string;
  savedAt?: string;
};

type CCCProfiles = Record<string, CCCCompetencyProfile>;

type JsonRecord = Record<string, unknown>;

type StoredTarget = {
  occupationTitle?: string;
  subarea?: string;
  level?: string | number;
};

type StoredCluster = {
  id?: string | number;
  clusterName?: string;
  suggestedName?: string;
  name?: string;
  items?: unknown[];
  cards?: unknown[];
  finalised?: boolean;
  target?: StoredTarget;
};

type ProjectResponse = {
  id?: string | number;
  project_code?: string;
  code?: string;
  project_title?: string;
  title?: string;
  sector_name?: string;
  sector?: string;
  subsector_name?: string;
  subsector?: string;
  field?: string;
  area?: string;
  level?: string | number;
  tahap?: string | number;
  status?: string;
};

type CCCGenerateResult = {
  learningOutcomes?: string[];
  knowledgeItems?: string[];
  attitudeItems?: string[];
  safetyItems?: string[];
  environmentItems?: string[];
};

const LEVEL_LABELS: Record<string, string> = {
  "1": "ONE (1)",
  "2": "TWO (2)",
  "3": "THREE (3)",
  "4": "FOUR (4)",
  "5": "FIVE (5)",
  "6": "SIX (6)",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeList(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return [""];

  const cleaned = value.map(cleanText);
  return cleaned.length > 0 ? cleaned : [""];
}

function splitEditableMultiline(value: string) {
  const lines = value.split(/\r?\n/);

  return lines.length > 0 ? lines : [""];
}

function hasMeaningfulLine(items: string[]) {
  return items.some((item) => item.trim());
}

function splitNumberedLine(value: string) {
  const match = cleanText(value).match(/^(\d+(?:\.\d+)*\.?)\s*(.*)$/);

  if (!match) {
    return { number: "", text: cleanText(value) };
  }

  return {
    number: match[1],
    text: match[2],
  };
}

function formatDocumentLines(items: string[], fallbackPrefix: number) {
  return items
    .map(cleanText)
    .filter(Boolean)
    .map((item, index) => {
      const numbered = splitNumberedLine(item);
      return numbered.number
        ? numbered
        : { number: `${fallbackPrefix}.${index + 1}`, text: item };
    });
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

function buildCompetenciesFromClusters(clusters: StoredCluster[]): Competency[] {
  return clusters.map((cluster, clusterIndex) => {
    const code = `CC${pad(clusterIndex + 1)}`;
    const title =
      cluster.clusterName ??
      cluster.suggestedName ??
      cluster.name ??
      `Competency ${clusterIndex + 1}`;

    return {
      code,
      title,
      units: extractClusterItems(cluster).map((item, itemIndex) => ({
        competencyCode: code,
        competencyTitle: title,
        unitCode: `${code}-WA${pad(itemIndex + 1)}`,
        unitTitle: item,
      })),
    };
  });
}

function normalizeCCPUnitProfile(profile?: Partial<CCPUnitProfile>): CCPUnitProfile {
  return {
    workSteps: normalizeList(profile?.workSteps),
    performanceCriteria: normalizeList(profile?.performanceCriteria),
    generatedAt: profile?.generatedAt,
    savedAt: profile?.savedAt,
  };
}

function normalizeCCPCompetencyProfile(
  profile?: Partial<CCPCompetencyProfile>
): CCPCompetencyProfile {
  return {
    descriptor: cleanText(profile?.descriptor),
    units: isRecord(profile?.units)
      ? Object.fromEntries(
          Object.entries(profile.units).map(([unitCode, unitProfile]) => [
            unitCode,
            normalizeCCPUnitProfile(
              isRecord(unitProfile)
                ? (unitProfile as Partial<CCPUnitProfile>)
                : {}
            ),
          ])
        )
      : {},
    generatedAt: profile?.generatedAt,
    savedAt: profile?.savedAt,
  };
}

function normalizeCCPProfiles(raw: unknown, competencies: Competency[]): CCPProfiles {
  if (!isRecord(raw)) return {};

  const nextProfiles: CCPProfiles = {};

  for (const competency of competencies) {
    const rawProfile = raw[competency.code];

    if (isRecord(rawProfile)) {
      nextProfiles[competency.code] = normalizeCCPCompetencyProfile(
        rawProfile as Partial<CCPCompetencyProfile>
      );
    }
  }

  return nextProfiles;
}

function normalizeCCCUnitProfile(profile?: Partial<CCCUnitProfile>): CCCUnitProfile {
  return {
    knowledge: normalizeList(profile?.knowledge),
    attitude: normalizeList(profile?.attitude),
    safety: normalizeList(profile?.safety),
    environment: normalizeList(profile?.environment),
    generatedAt: profile?.generatedAt,
    savedAt: profile?.savedAt,
  };
}

function defaultLearningOutcome(competency: Competency) {
  const unitTitles = competency.units
    .map((unit) => unit.unitTitle)
    .filter(Boolean);
  const scope = unitTitles.map((unit) => unit.toLowerCase()).join(", ");
  const numberedUnits = unitTitles
    .map((unit, index) => `${index + 1}. ${unit}.`)
    .join("\n");

  return `The learning outcomes of this competency are to enable the trainees to perform ${competency.title.toLowerCase()} by applying ${scope} in accordance with established industry guidelines, work procedures, and safety requirements.

Upon completion of this competency, trainees should be able to:
${numberedUnits}`;
}

function formatLearningOutcomeFromAI(items: string[], competency: Competency) {
  const cleaned = items.map(cleanText).filter(Boolean);

  if (cleaned.length === 0) return defaultLearningOutcome(competency);

  return cleaned.join("\n");
}

function normalizeCCCCompetencyProfile(
  competency: Competency,
  profile?: Partial<CCCCompetencyProfile>
): CCCCompetencyProfile {
  return {
    learningOutcomeIntro:
      cleanText(profile?.learningOutcomeIntro) || defaultLearningOutcome(competency),
    trainingPrerequisite: cleanText(profile?.trainingPrerequisite),
    units: isRecord(profile?.units)
      ? Object.fromEntries(
          Object.entries(profile.units).map(([unitCode, unitProfile]) => [
            unitCode,
            normalizeCCCUnitProfile(
              isRecord(unitProfile)
                ? (unitProfile as Partial<CCCUnitProfile>)
                : {}
            ),
          ])
        )
      : {},
    generatedAt: profile?.generatedAt,
    savedAt: profile?.savedAt,
  };
}

function normalizeCCCProfiles(raw: unknown, competencies: Competency[]): CCCProfiles {
  if (!isRecord(raw)) return {};

  const nextProfiles: CCCProfiles = {};

  for (const competency of competencies) {
    const rawProfile = raw[competency.code];

    if (isRecord(rawProfile)) {
      nextProfiles[competency.code] = normalizeCCCCompetencyProfile(
        competency,
        rawProfile as Partial<CCCCompetencyProfile>
      );
    }
  }

  return nextProfiles;
}

function isCCCUnitComplete(profile?: CCCUnitProfile) {
  const unitProfile = normalizeCCCUnitProfile(profile);

  return (
    hasMeaningfulLine(unitProfile.knowledge) &&
    hasMeaningfulLine(unitProfile.attitude) &&
    hasMeaningfulLine(unitProfile.safety) &&
    hasMeaningfulLine(unitProfile.environment)
  );
}

function isCCCCompetencyComplete(
  competency: Competency,
  profile?: CCCCompetencyProfile
) {
  const competencyProfile = normalizeCCCCompetencyProfile(competency, profile);

  if (!competencyProfile.learningOutcomeIntro.trim()) return false;

  return competency.units.every((unit) =>
    isCCCUnitComplete(competencyProfile.units[unit.unitCode])
  );
}

function isCCCCompetencySaved(
  competency: Competency,
  profile?: CCCCompetencyProfile
) {
  const competencyProfile = normalizeCCCCompetencyProfile(competency, profile);

  return (
    isCCCCompetencyComplete(competency, competencyProfile) &&
    Boolean(competencyProfile.savedAt)
  );
}

async function loadProfile(endpoint: "ccp" | "ccc", projectId: string) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/${endpoint}/profile/${projectId}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuatkan profil ${endpoint.toUpperCase()}.`);
  }

  return res.json() as Promise<{ profiles?: unknown }>;
}

async function saveCCCProfileToBackend(projectId: string, profiles: CCCProfiles) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/ccc/profile/${projectId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ profiles }),
  });

  if (!res.ok) {
    throw new Error("Gagal menyimpan profil CCC.");
  }

  return res.json();
}

function CCCDocumentMode({
  projectInfo,
  selectedCompetency,
  ccpProfile,
  cccProfile,
}: {
  projectInfo: ProjectInfo;
  selectedCompetency: Competency | null;
  ccpProfile: CCPCompetencyProfile;
  cccProfile: CCCCompetencyProfile | null;
}) {
  if (!selectedCompetency || !cccProfile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Pilih Core Competency untuk melihat Document Mode CCC.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-900">
        Construction Competency Curriculum (CCC)
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-black text-sm text-slate-950">
          <tbody>
            <tr>
              <th className="w-64 border border-black bg-slate-300 px-3 py-3 text-left">
                SECTION
              </th>
              <td className="border border-black px-3 py-3 uppercase">
                {projectInfo.sector}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left">
                GROUP
              </th>
              <td className="border border-black px-3 py-3 uppercase">
                {projectInfo.group}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left">
                AREA
              </th>
              <td className="border border-black px-3 py-3 uppercase">
                {projectInfo.area}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left">
                COCS TITLE
              </th>
              <td className="border border-black px-3 py-3 uppercase">
                {projectInfo.title}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left">
                COMPETENCY TITLE
              </th>
              <td className="border border-black px-3 py-3 uppercase">
                {selectedCompetency.title}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left align-top">
                LEARNING OUTCOMES
              </th>
              <td className="border border-black px-3 py-3 leading-7 text-justify">
                {cccProfile.learningOutcomeIntro || "-"}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left">
                TRAINING PREREQUISITE (SPECIFIC)
              </th>
              <td className="border border-black px-3 py-3">
                {cccProfile.trainingPrerequisite || "-"}
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left">
                COMPETENCY CODE
              </th>
              <td className="border border-black p-0">
                <div className="grid grid-cols-[1fr_180px_1fr]">
                  <div className="px-3 py-3">{selectedCompetency.code}</div>
                  <div className="border-x border-black bg-slate-300 px-3 py-3 font-bold">
                    COCS LEVEL
                  </div>
                  <div className="px-3 py-3">
                    {LEVEL_LABELS[projectInfo.level] || projectInfo.level}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-6 min-w-full border border-black text-sm text-slate-950">
          <thead>
            <tr className="bg-slate-300">
              <th className="w-[20%] border border-black px-3 py-3">
                COMPETENCY UNIT
              </th>
              <th className="w-[25%] border border-black px-3 py-3">
                KNOWLEDGE
              </th>
              <th className="w-[25%] border border-black px-3 py-3">
                WORK STEPS
              </th>
              <th className="border border-black px-3 py-3">
                ATTITUDE / SAFETY / ENVIRONMENT
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedCompetency.units.map((unit, unitIndex) => {
              const ccpUnit = normalizeCCPUnitProfile(
                ccpProfile.units[unit.unitCode]
              );
              const cccUnit = normalizeCCCUnitProfile(
                cccProfile.units[unit.unitCode]
              );
              const ase = [
                ...cccUnit.attitude,
                ...cccUnit.safety,
                ...cccUnit.environment,
              ];

              return (
                <tr key={unit.unitCode}>
                  <td className="border border-black px-3 py-3 align-top">
                    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
                      <span>{unitIndex + 1}.</span>
                      <div>
                        <div className="font-semibold">{unit.unitTitle}</div>
                        <div className="mt-2 text-xs">{unit.unitCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border border-black px-3 py-3 align-top">
                    <DocumentLineList
                      lines={formatDocumentLines(cccUnit.knowledge, unitIndex + 1)}
                    />
                  </td>
                  <td className="border border-black px-3 py-3 align-top">
                    <DocumentLineList
                      lines={formatDocumentLines(ccpUnit.workSteps, unitIndex + 1)}
                    />
                  </td>
                  <td className="border border-black px-3 py-3 align-top">
                    <DocumentLineList
                      lines={formatDocumentLines(ase, unitIndex + 1)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentLineList({
  lines,
}: {
  lines: Array<{ number: string; text: string }>;
}) {
  if (lines.length === 0) return <>-</>;

  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <div
          key={`${line.number}-${index}`}
          className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2 leading-6"
        >
          <span className="tabular-nums">{line.number}</span>
          <span className="text-justify">{line.text}</span>
        </div>
      ))}
    </div>
  );
}

function CCCPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState<StoredCluster[]>([]);
  const [ccpProfiles, setCCPProfiles] = useState<CCPProfiles>({});
  const [cccProfiles, setCCCProfiles] = useState<CCCProfiles>({});
  const [selectedCompetencyCode, setSelectedCompetencyCode] = useState("");
  const [competencyListCollapsed, setCompetencyListCollapsed] = useState(false);
  const [dirtyUnitKeys, setDirtyUnitKeys] = useState<Set<string>>(new Set());
  const [generatingUnitKey, setGeneratingUnitKey] = useState<string | null>(null);
  const [generatingLearningOutcome, setGeneratingLearningOutcome] =
    useState(false);
  const [savingUnitKey, setSavingUnitKey] = useState<string | null>(null);
  const [savingCompetencyCode, setSavingCompetencyCode] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    id: "",
    code: "-",
    title: "-",
    sector: "-",
    group: "-",
    area: "-",
    subarea: "-",
    level: "-",
    status: "draft",
  });

  const sessionName = useMemo(() => {
    if (!projectId || projectInfo.title === "-") return "";

    return `project-${projectId}-${slugify(projectInfo.title || "dacum-session")}`;
  }, [projectId, projectInfo.title]);

  const competencies = useMemo(
    () => buildCompetenciesFromClusters(clusters),
    [clusters]
  );

  const selectedCompetency =
    competencies.find((item) => item.code === selectedCompetencyCode) ??
    competencies[0] ??
    null;

  const selectedCCPProfile = selectedCompetency
    ? normalizeCCPCompetencyProfile(ccpProfiles[selectedCompetency.code])
    : normalizeCCPCompetencyProfile();

  const selectedCCCProfile = selectedCompetency
    ? normalizeCCCCompetencyProfile(
        selectedCompetency,
        cccProfiles[selectedCompetency.code]
      )
    : null;

  const selectedCompetencyComplete =
    selectedCompetency && selectedCCCProfile
      ? isCCCCompetencyComplete(selectedCompetency, selectedCCCProfile)
      : false;

  const selectedCompetencySaved =
    selectedCompetency && selectedCCCProfile
      ? isCCCCompetencySaved(selectedCompetency, selectedCCCProfile)
      : false;

  const savedCompetencyCount = competencies.filter((competency) =>
    isCCCCompetencySaved(competency, cccProfiles[competency.code])
  ).length;
  const allCompetenciesSaved =
    competencies.length > 0 && savedCompetencyCount === competencies.length;

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setLoading(false);
        setErrorMessage("Sila pilih projek daripada Senarai Projek COCS dahulu.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const token = getAuthToken();
        let target: StoredTarget | null = null;

        try {
          const cosRes = await fetch(`${API_URL}/cos/structure/${projectId}`, {
            cache: "no-store",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (cosRes.ok) {
            const cosData = await cosRes.json();
            target = cosData.target || null;
          }
        } catch (error) {
          console.error("Gagal load target COS untuk CCC:", error);
        }

        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Gagal mendapatkan maklumat projek.");
        }

        const data = (await res.json()) as ProjectResponse;
        const resolvedId = data.id ?? projectId;

        setProjectInfo({
          id: String(resolvedId),
          code: data.project_code || data.code || `COCS/${resolvedId}`,
          title:
            target?.occupationTitle ||
            data.project_title ||
            data.title ||
            "Untitled Project",
          sector: data.sector_name || data.sector || "-",
          group: data.subsector_name || data.subsector || data.field || "-",
          area: data.area || "-",
          subarea: target?.subarea || "-",
          level: String(target?.level || data.level || data.tahap || "-"),
          status: data.status || "draft",
        });
      } catch (error) {
        console.error("Gagal load project CCC:", error);
        setErrorMessage("Gagal memuatkan maklumat projek CCC.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (!sessionName) return;

    async function loadCCPCClusters() {
      try {
        const selectionRes = await fetch(`${API_URL}/ccpc/selection/${sessionName}`, {
          cache: "no-store",
        });

        if (selectionRes.ok) {
          const selectionPayload = await selectionRes.json();
          const selectedClusters = getUsableClusters(
            extractStoredClusters(selectionPayload)
          );

          if (selectedClusters.length > 0) {
            setClusters(selectedClusters);
            return;
          }
        }

        const res = await fetch(`${API_URL}/ccpc/clusters/${sessionName}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setClusters([]);
          return;
        }

        const payload = await res.json();
        setClusters(getUsableClusters(extractStoredClusters(payload)));
      } catch (error) {
        console.error("Gagal load CCPC clusters untuk CCC:", error);
        setClusters([]);
      }
    }

    loadCCPCClusters();
  }, [sessionName]);

  useEffect(() => {
    if (!projectId || competencies.length === 0) {
      queueMicrotask(() => {
        setCCPProfiles({});
        setCCCProfiles({});
      });
      return;
    }

    async function loadProfiles() {
      try {
        const [ccpData, cccData] = await Promise.all([
          loadProfile("ccp", projectId),
          loadProfile("ccc", projectId),
        ]);

        setCCPProfiles(normalizeCCPProfiles(ccpData.profiles, competencies));
        setCCCProfiles(normalizeCCCProfiles(cccData.profiles, competencies));
      } catch (error) {
        console.error("Gagal load profil CCC:", error);
        setErrorMessage("Gagal memuatkan profil CCP/CCC projek ini.");
      }
    }

    loadProfiles();
  }, [competencies, projectId]);

  useEffect(() => {
    if (!selectedCompetencyCode && competencies.length > 0) {
      queueMicrotask(() => setSelectedCompetencyCode(competencies[0].code));
    }
  }, [competencies, selectedCompetencyCode]);

  function showMessage(value: string) {
    setMessage(value);
    setTimeout(() => setMessage(""), 2500);
  }

  function getUnitKey(competencyCode: string, unitCode: string) {
    return `${competencyCode}:${unitCode}`;
  }

  function markUnitDirty(competencyCode: string, unitCode: string) {
    const unitKey = getUnitKey(competencyCode, unitCode);

    setDirtyUnitKeys((current) => {
      const next = new Set(current);
      next.add(unitKey);
      return next;
    });
  }

  function clearDirtyUnits(competencyCode: string, unitCodes?: string[]) {
    setDirtyUnitKeys((current) => {
      const next = new Set(current);
      const allowedUnitCodes = unitCodes ? new Set(unitCodes) : null;

      for (const key of current) {
        const [keyCompetencyCode, keyUnitCode] = key.split(":");
        if (
          keyCompetencyCode === competencyCode &&
          (!allowedUnitCodes || allowedUnitCodes.has(keyUnitCode))
        ) {
          next.delete(key);
        }
      }

      return next;
    });
  }

  function buildNextProfile(
    competencyCode: string,
    updater: (profile: CCCCompetencyProfile) => CCCCompetencyProfile
  ) {
    const competency = competencies.find((item) => item.code === competencyCode);

    if (!competency) return cccProfiles;

    return {
      ...cccProfiles,
      [competencyCode]: updater(
        normalizeCCCCompetencyProfile(competency, cccProfiles[competencyCode])
      ),
    };
  }

  function persistProfiles(nextProfiles: CCCProfiles) {
    setCCCProfiles(nextProfiles);

    if (projectId) {
      void saveCCCProfileToBackend(projectId, nextProfiles).catch((error) => {
        console.error("Gagal simpan profil CCC ke backend:", error);
      });
    }
  }

  function markProfileUnsaved(profile: CCCCompetencyProfile) {
    return {
      ...profile,
      savedAt: undefined,
    };
  }

  function updateLearningOutcome(value: string) {
    if (!selectedCompetency) return;

    persistProfiles(
      buildNextProfile(selectedCompetency.code, (profile) => ({
        ...markProfileUnsaved(profile),
        learningOutcomeIntro: value,
      }))
    );
  }

  function updateTrainingPrerequisite(value: string) {
    if (!selectedCompetency) return;

    persistProfiles(
      buildNextProfile(selectedCompetency.code, (profile) => ({
        ...markProfileUnsaved(profile),
        trainingPrerequisite: value,
      }))
    );
  }

  async function generateLearningOutcome() {
    if (!selectedCompetency) return;

    try {
      setGeneratingLearningOutcome(true);
      setErrorMessage("");

      const unitDetails = selectedCompetency.units.map((unit) => {
        const ccpUnit = normalizeCCPUnitProfile(
          ccpProfiles[unit.competencyCode]?.units?.[unit.unitCode]
        );

        return {
          unitTitle: unit.unitTitle,
          workSteps: ccpUnit.workSteps.filter(Boolean),
          performanceCriteria: ccpUnit.performanceCriteria.filter(Boolean),
        };
      });

      const res = await fetch("/api/ccc/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "learningOutcomes",
          competencyTitle: selectedCompetency.title,
          cuTitle: selectedCompetency.title,
          competencyUnits: selectedCompetency.units.map((unit) => unit.unitTitle),
          unitDetails,
        }),
      });

      const responseText = await res.text();

      if (!res.ok) {
        throw new Error(responseText || "Gagal menjana Learning Outcomes.");
      }

      const generated = JSON.parse(responseText) as CCCGenerateResult;
      const learningOutcome = formatLearningOutcomeFromAI(
        generated.learningOutcomes ?? [],
        selectedCompetency
      );

      persistProfiles(
        buildNextProfile(selectedCompetency.code, (profile) => ({
          ...markProfileUnsaved(profile),
          learningOutcomeIntro: learningOutcome,
          generatedAt: new Date().toISOString(),
        }))
      );

      showMessage("Learning Outcomes berjaya dijana.");
    } catch (error) {
      console.error("Gagal jana Learning Outcomes:", error);
      setErrorMessage("Gagal menjana Learning Outcomes. Sila semak API AI.");
    } finally {
      setGeneratingLearningOutcome(false);
    }
  }

  function updateUnitField(
    unit: CompetencyUnit,
    field: keyof Pick<
      CCCUnitProfile,
      "knowledge" | "attitude" | "safety" | "environment"
    >,
    value: string
  ) {
    markUnitDirty(unit.competencyCode, unit.unitCode);

    persistProfiles(
      buildNextProfile(unit.competencyCode, (profile) => ({
        ...markProfileUnsaved(profile),
        units: {
          ...profile.units,
          [unit.unitCode]: {
            ...normalizeCCCUnitProfile(profile.units[unit.unitCode]),
            [field]: splitEditableMultiline(value),
          },
        },
      }))
    );
  }

  async function generateUnit(unit: CompetencyUnit) {
    const ccpUnit = normalizeCCPUnitProfile(
      ccpProfiles[unit.competencyCode]?.units?.[unit.unitCode]
    );
    const unitKey = getUnitKey(unit.competencyCode, unit.unitCode);

    try {
      setGeneratingUnitKey(unitKey);
      setErrorMessage("");

      const res = await fetch("/api/ccc/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competencyTitle: unit.competencyTitle,
          cuTitle: unit.unitTitle,
          workStepTitle: ccpUnit.workSteps.filter(Boolean).join("; "),
          workSteps: ccpUnit.workSteps.filter(Boolean),
          competencyUnits:
            selectedCompetency?.units.map((competencyUnit) => competencyUnit.unitTitle) ??
            [unit.unitTitle],
          performanceCriteriaTexts: ccpUnit.performanceCriteria.filter(Boolean),
        }),
      });

      const responseText = await res.text();

      if (!res.ok) {
        throw new Error(responseText || "Gagal menjana CCC menggunakan AI.");
      }

      const generated = JSON.parse(responseText) as CCCGenerateResult;
      const knowledge = normalizeList(generated.knowledgeItems);
      const attitude = normalizeList(generated.attitudeItems);
      const safety = normalizeList(generated.safetyItems);
      const environment = normalizeList(generated.environmentItems);
      const learningOutcome = selectedCompetency
        ? formatLearningOutcomeFromAI(
            generated.learningOutcomes ?? [],
            selectedCompetency
          )
        : "";

      markUnitDirty(unit.competencyCode, unit.unitCode);

      persistProfiles(
        buildNextProfile(unit.competencyCode, (profile) => ({
          ...markProfileUnsaved(profile),
          learningOutcomeIntro:
            learningOutcome || profile.learningOutcomeIntro,
          units: {
            ...profile.units,
            [unit.unitCode]: normalizeCCCUnitProfile({
              knowledge,
              attitude,
              safety,
              environment,
              generatedAt: new Date().toISOString(),
            }),
          },
          generatedAt: new Date().toISOString(),
        }))
      );

      showMessage(`Kandungan CCC berjaya dijana untuk ${unit.unitCode}.`);
    } catch (error) {
      console.error("Gagal jana CCC unit:", error);
      setErrorMessage(
        "Gagal menjana Knowledge, Attitude, Safety dan Environment. Sila semak API AI."
      );
    } finally {
      setGeneratingUnitKey(null);
    }
  }

  function clearUnitProfile(unit: CompetencyUnit) {
    const confirmClear = window.confirm(
      `Kosongkan kandungan CCC untuk "${unit.unitTitle}"?`
    );

    if (!confirmClear) return;

    markUnitDirty(unit.competencyCode, unit.unitCode);

    persistProfiles(
      buildNextProfile(unit.competencyCode, (profile) => {
        const nextUnits = { ...profile.units };
        delete nextUnits[unit.unitCode];

        return {
          ...markProfileUnsaved(profile),
          units: nextUnits,
        };
      })
    );
  }

  async function saveUnitProfile(unit: CompetencyUnit) {
    const unitKey = getUnitKey(unit.competencyCode, unit.unitCode);

    if (!dirtyUnitKeys.has(unitKey)) return;

    const nextProfiles = buildNextProfile(unit.competencyCode, (profile) => ({
      ...markProfileUnsaved(profile),
      units: {
        ...profile.units,
        [unit.unitCode]: {
          ...normalizeCCCUnitProfile(profile.units[unit.unitCode]),
          savedAt: new Date().toISOString(),
        },
      },
    }));

    try {
      setSavingUnitKey(unitKey);
      setCCCProfiles(nextProfiles);

      if (projectId) {
        await saveCCCProfileToBackend(projectId, nextProfiles);
      }

      clearDirtyUnits(unit.competencyCode, [unit.unitCode]);
      showMessage(`${unit.unitCode} berjaya disimpan.`);
    } catch (error) {
      console.error("Gagal simpan CCC unit:", error);
      setErrorMessage("Gagal simpan Competency Unit CCC. Sila cuba semula.");
    } finally {
      setSavingUnitKey(null);
    }
  }

  async function saveSelectedCompetency() {
    if (!selectedCompetency || !selectedCCCProfile) return;

    if (!selectedCompetencyComplete) {
      alert(
        "Lengkapkan Learning Outcomes dan semua Knowledge, Attitude, Safety serta Environment sebelum Save."
      );
      return;
    }

    const savedAt = new Date().toISOString();
    const nextProfiles = buildNextProfile(selectedCompetency.code, (profile) => ({
      ...profile,
      savedAt,
      units: Object.fromEntries(
        selectedCompetency.units.map((unit) => [
          unit.unitCode,
          {
            ...normalizeCCCUnitProfile(profile.units[unit.unitCode]),
            savedAt,
          },
        ])
      ),
    }));

    try {
      setSavingCompetencyCode(selectedCompetency.code);
      setCCCProfiles(nextProfiles);

      if (projectId) {
        await saveCCCProfileToBackend(projectId, nextProfiles);
      }

      clearDirtyUnits(
        selectedCompetency.code,
        selectedCompetency.units.map((unit) => unit.unitCode)
      );
      showMessage(`${selectedCompetency.code} berjaya disimpan untuk CCC.`);
    } catch (error) {
      console.error("Gagal simpan Core CCC:", error);
      setErrorMessage("Gagal menyimpan Core Competency CCC. Sila cuba semula.");
    } finally {
      setSavingCompetencyCode(null);
    }
  }

  if (!projectId) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-800">
          Sila pilih projek daripada Senarai Projek COCS terlebih dahulu.
        </div>

        <button
          type="button"
          onClick={() => router.push("/projects")}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Pergi ke Senarai Projek
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">Projek:</span>
            <span className="text-2xl font-bold text-blue-700">
              {projectInfo.code} - {projectInfo.title}
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

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Dashboard</span>
          <ChevronRight size={16} />
          <span>Projek COCS</span>
          <ChevronRight size={16} />
          <span className="font-medium text-slate-700">Curriculum (CCC)</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Curriculum (CCC)
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Lengkapkan Knowledge, Work Step, Attitude, Safety dan Environment
                berdasarkan CCP.
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

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm lg:grid-cols-5">
        <div>
          <p className="text-sm text-slate-500">Bidang Pekerjaan</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.title}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Tahap</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {LEVEL_LABELS[projectInfo.level] || projectInfo.level}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Laluan Kerjaya</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {projectInfo.subarea}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Core Competency</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {competencies.length}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">CCC Disimpan</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {savedCompetencyCount}/{competencies.length}
          </p>
        </div>
      </div>

      {competencies.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-800">
          Tiada Core Competency ditemui. Sila pastikan CCPC telah dipilih dan
          CCP telah disimpan terlebih dahulu.
          <div className="mt-4">
            <Link
              href={`/ccp?projectId=${projectId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ArrowLeft size={16} />
              Kembali ke CCP
            </Link>
          </div>
        </div>
      ) : viewMode === "document" ? (
        <CCCDocumentMode
          projectInfo={projectInfo}
          selectedCompetency={selectedCompetency}
          ccpProfile={selectedCCPProfile}
          cccProfile={selectedCCCProfile}
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-6 transition-all ${
            competencyListCollapsed
              ? "xl:grid-cols-[84px_minmax(0,1fr)]"
              : "xl:grid-cols-[360px_minmax(0,1fr)]"
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              className={`border-b border-slate-200 px-5 py-4 ${
                competencyListCollapsed
                  ? "flex justify-center"
                  : "flex items-start justify-between gap-3"
              }`}
            >
              {competencyListCollapsed ? null : (
                <div>
                  <h2 className="text-lg font-bold text-blue-700">
                    Senarai Competency
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pilih Core Competency untuk bina set CCC berkenaan.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCompetencyListCollapsed((current) => !current)}
                title={
                  competencyListCollapsed
                    ? "Buka Senarai Competency"
                    : "Sorok Senarai Competency"
                }
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
              >
                {competencyListCollapsed ? (
                  <PanelLeftOpen size={18} />
                ) : (
                  <PanelLeftClose size={18} />
                )}
              </button>
            </div>

            {competencyListCollapsed ? (
              <div className="flex flex-col items-center gap-3 px-3 py-4">
                <div className="rounded-xl bg-blue-50 px-2.5 py-2 text-center text-xs font-bold text-blue-700">
                  {selectedCompetency?.code || "-"}
                </div>
                <div className="text-center text-[11px] font-semibold text-slate-500">
                  {savedCompetencyCount}/{competencies.length}
                </div>
              </div>
            ) : (
              <div className="max-h-[680px] space-y-2 overflow-y-auto p-4">
                {competencies.map((competency) => {
                  const active = selectedCompetency?.code === competency.code;
                  const profile = normalizeCCCCompetencyProfile(
                    competency,
                    cccProfiles[competency.code]
                  );
                  const complete = isCCCCompetencyComplete(competency, profile);
                  const saved = isCCCCompetencySaved(competency, profile);

                  return (
                    <button
                      key={competency.code}
                      type="button"
                      onClick={() => setSelectedCompetencyCode(competency.code)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-blue-700">
                          {competency.code}
                        </span>
                        {saved ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Disimpan
                          </span>
                        ) : complete ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Perlu Save
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {competency.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {competency.units.length} Competency Unit
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-blue-700">
                  Workspace CCC
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCompetency?.code} - {selectedCompetency?.title}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {selectedCompetencySaved
                    ? "Status: CCC untuk Core Competency ini telah disimpan."
                    : selectedCompetencyComplete
                      ? "Status: Lengkap, perlu klik Save."
                      : "Status: Lengkapkan semua unit CCC dahulu."}
                </p>
              </div>

              <button
                type="button"
                onClick={saveSelectedCompetency}
                disabled={
                  !selectedCompetencyComplete ||
                  selectedCompetencySaved ||
                  savingCompetencyCode === selectedCompetency?.code
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <Save size={16} />
                {savingCompetencyCode === selectedCompetency?.code
                  ? "Menyimpan..."
                  : selectedCompetencySaved
                    ? "Telah Disimpan"
                    : "Save Core CCC"}
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <BookOpen size={18} className="mt-0.5 text-blue-700" />
                  <div className="text-sm leading-6 text-slate-600">
                    CCC menggunakan Competency Unit, Work Step dan Performance
                    Criteria daripada CCP. AI membantu menjana Knowledge,
                    Attitude, Safety dan Environment untuk setiap unit.
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-300">
                <table className="min-w-full text-sm">
                  <tbody>
                    <tr>
                      <th className="w-56 border border-slate-300 bg-slate-100 px-4 py-3 text-left font-bold text-slate-900">
                        COMPETENCY TITLE & CODE
                      </th>
                      <td className="border border-slate-300 px-4 py-3">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px]">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900">
                            {selectedCompetency?.title || "-"}
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-bold text-blue-700">
                            {selectedCompetency?.code || "-"}
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th className="border border-slate-300 bg-slate-100 px-4 py-3 text-left align-top font-bold text-slate-900">
                        LEARNING OUTCOMES
                      </th>
                      <td className="border border-slate-300 px-4 py-3">
                        <div className="mb-3 flex justify-end">
                          <button
                            type="button"
                            onClick={generateLearningOutcome}
                            disabled={
                              !selectedCompetency || generatingLearningOutcome
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <Sparkles size={14} />
                            {generatingLearningOutcome
                              ? "Menjana..."
                              : "Jana AI"}
                          </button>
                        </div>
                        <textarea
                          value={selectedCCCProfile?.learningOutcomeIntro || ""}
                          onChange={(event) =>
                            updateLearningOutcome(event.target.value)
                          }
                          rows={8}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder={`The learning outcomes of this competency are to enable the trainees to ...

Upon completion of this competency, trainees should be able to:
1. ${selectedCompetency?.units[0]?.unitTitle || "Competency Unit 1"}.
2. ${selectedCompetency?.units[1]?.unitTitle || "Competency Unit 2"}.`}
                        />
                      </td>
                    </tr>

                    <tr>
                      <th className="border border-slate-300 bg-slate-100 px-4 py-3 text-left align-top font-bold text-slate-900">
                        TRAINING PREREQUISITE
                      </th>
                      <td className="border border-slate-300 px-4 py-3">
                        <textarea
                          value={selectedCCCProfile?.trainingPrerequisite || ""}
                          onChange={(event) =>
                            updateTrainingPrerequisite(event.target.value)
                          }
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="Contoh: Telah melengkapkan latihan asas atau pengalaman berkaitan."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-300">
                <table className="min-w-[1320px] text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-slate-700">
                      <th className="w-[18%] border border-slate-300 px-4 py-3">
                        COMPETENCY UNIT
                      </th>
                      <th className="w-[23%] border border-slate-300 px-4 py-3">
                        KNOWLEDGE
                      </th>
                      <th className="w-[23%] border border-slate-300 px-4 py-3">
                        WORK STEP
                      </th>
                      <th className="w-[26%] border border-slate-300 px-4 py-3">
                        ATTITUDE / SAFETY / ENVIRONMENT
                      </th>
                      <th className="w-36 border border-slate-300 px-4 py-3 text-center">
                        Tindakan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompetency?.units.map((unit) => {
                      const ccpUnit = normalizeCCPUnitProfile(
                        selectedCCPProfile.units[unit.unitCode]
                      );
                      const cccUnit = normalizeCCCUnitProfile(
                        selectedCCCProfile?.units[unit.unitCode]
                      );
                      const unitKey = getUnitKey(
                        unit.competencyCode,
                        unit.unitCode
                      );
                      const unitDirty = dirtyUnitKeys.has(unitKey);

                      return (
                        <tr key={unit.unitCode}>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <div className="font-bold text-blue-700">
                              {unit.unitCode}
                            </div>
                            <div className="mt-2 font-semibold text-slate-900">
                              {unit.unitTitle}
                            </div>
                          </td>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <textarea
                              value={cccUnit.knowledge.join("\n")}
                              onChange={(event) =>
                                updateUnitField(
                                  unit,
                                  "knowledge",
                                  event.target.value
                                )
                              }
                              rows={8}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                              placeholder="Knowledge akan dijana oleh AI atau boleh dikemaskini di sini."
                            />
                          </td>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                              {hasMeaningfulLine(ccpUnit.workSteps) ? (
                                ccpUnit.workSteps
                                  .filter((item) => item.trim())
                                  .map((item, index) => (
                                    <div
                                      key={`${unit.unitCode}-ws-${index}`}
                                      className="text-justify"
                                    >
                                      {item}
                                    </div>
                                  ))
                              ) : (
                                <span className="text-slate-400">
                                  Work Step belum dijana di CCP.
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <div className="space-y-3">
                              <textarea
                                value={cccUnit.attitude.join("\n")}
                                onChange={(event) =>
                                  updateUnitField(
                                    unit,
                                    "attitude",
                                    event.target.value
                                  )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                                placeholder="Attitude"
                              />
                              <textarea
                                value={cccUnit.safety.join("\n")}
                                onChange={(event) =>
                                  updateUnitField(
                                    unit,
                                    "safety",
                                    event.target.value
                                  )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                                placeholder="Safety"
                              />
                              <textarea
                                value={cccUnit.environment.join("\n")}
                                onChange={(event) =>
                                  updateUnitField(
                                    unit,
                                    "environment",
                                    event.target.value
                                  )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                                placeholder="Environment"
                              />
                            </div>
                          </td>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => generateUnit(unit)}
                                disabled={Boolean(generatingUnitKey)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                              >
                                <Sparkles size={14} />
                                {generatingUnitKey === unitKey
                                  ? "Menjana..."
                                  : "Jana AI"}
                              </button>
                              <button
                                type="button"
                                onClick={() => clearUnitProfile(unit)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Kosongkan
                              </button>
                              <button
                                type="button"
                                onClick={() => saveUnitProfile(unit)}
                                disabled={!unitDirty || savingUnitKey === unitKey}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                <Save size={14} />
                                {savingUnitKey === unitKey ? "Menyimpan..." : "Save"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedCompetency?.code || "-"} - Save Core CCC
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedCompetencySaved
                      ? "Core Competency ini telah disimpan dan boleh diteruskan."
                      : selectedCompetencyComplete
                        ? "Semua maklumat lengkap. Klik Save untuk sahkan Core CCC ini."
                        : "Lengkapkan semua medan CCC sebelum Save."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={saveSelectedCompetency}
                  disabled={
                    !selectedCompetencyComplete ||
                    selectedCompetencySaved ||
                    savingCompetencyCode === selectedCompetency?.code
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save size={16} />
                  {savingCompetencyCode === selectedCompetency?.code
                    ? "Menyimpan..."
                    : selectedCompetencySaved
                      ? "Telah Disimpan"
                      : "Save Core CCC"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/csp?projectId=${projectId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Kembali ke CSP
        </Link>

        {allCompetenciesSaved ? (
          <Link
            href={`/temm?projectId=${projectId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Seterusnya: TEMM
            <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Save semua Core CCC sebelum teruskan ke TEMM"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-5 py-3 font-semibold text-white"
          >
            Seterusnya: TEMM
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function CCCPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Memuatkan halaman CCC...
        </div>
      }
    >
      <CCCPageContent />
    </Suspense>
  );
}
