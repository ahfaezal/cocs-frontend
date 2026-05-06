"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileCheck2,
  Info,
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
};

type CCPCompetencyProfile = {
  descriptor: string;
  units: Record<string, CCPUnitProfile>;
  generatedAt?: string;
};

type CCPProfiles = Record<string, CCPCompetencyProfile>;

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
};

type StoredClusterPayload = StoredCluster[] | { clusters?: StoredCluster[] };

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

type CCPGenerateResult = {
  descriptor: string;
  workSteps: string[];
  performanceCriteria: string[];
  generatedAt?: string;
};

const EMPTY_UNIT_PROFILE: CCPUnitProfile = {
  workSteps: [""],
  performanceCriteria: [""],
};

const EMPTY_COMPETENCY_PROFILE: CCPCompetencyProfile = {
  descriptor: "",
  units: {},
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

function getTargetStorageKey(projectId: string) {
  return `cocs-target-occupation-${projectId}`;
}

function getClusterStorageKeys(projectId: string, title: string) {
  const titleSlug = slugify(title);
  const keys = [
    titleSlug ? `cocs-ccpc-ai-clusters-project-${projectId}-${titleSlug}` : "",
    titleSlug ? `cocs-ccpc-ai-clusters-${titleSlug}` : "",
    titleSlug ? `cocs-ccpc-ai-clusters-${projectId}-${titleSlug}` : "",
    projectId ? `cocs-ccpc-clusters-${projectId}` : "",
  ];

  return Array.from(new Set(keys.filter(Boolean)));
}

function getProfileStorageKey(projectId: string) {
  return `cocs-ccp-profile-${projectId}`;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined" || !key) return null;

  const saved = window.localStorage.getItem(key);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as T;
  } catch {
    return null;
  }
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

function splitMultiline(value: string) {
  const lines = value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : [""];
}

function normalizeUnitProfile(profile?: Partial<CCPUnitProfile>): CCPUnitProfile {
  return {
    workSteps: normalizeList(profile?.workSteps),
    performanceCriteria: normalizeList(profile?.performanceCriteria),
    generatedAt: profile?.generatedAt,
  };
}

function normalizeCompetencyProfile(
  profile?: Partial<CCPCompetencyProfile>
): CCPCompetencyProfile {
  return {
    descriptor: cleanText(profile?.descriptor),
    units: isRecord(profile?.units)
      ? Object.fromEntries(
          Object.entries(profile.units).map(([unitCode, unitProfile]) => [
            unitCode,
            normalizeUnitProfile(
              isRecord(unitProfile) ? (unitProfile as Partial<CCPUnitProfile>) : {}
            ),
          ])
        )
      : {},
    generatedAt: profile?.generatedAt,
  };
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

function extractStoredClusters(payload: StoredClusterPayload | null) {
  if (!payload) return [];

  return Array.isArray(payload) ? payload : payload.clusters ?? [];
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

function normalizeProfiles(raw: unknown, competencies: Competency[]): CCPProfiles {
  if (!isRecord(raw)) return {};

  const nextProfiles: CCPProfiles = {};

  for (const competency of competencies) {
    const rawProfile = raw[competency.code];

    if (isRecord(rawProfile) && "units" in rawProfile) {
      nextProfiles[competency.code] = normalizeCompetencyProfile(
        rawProfile as Partial<CCPCompetencyProfile>
      );
      continue;
    }

    const legacyUnits: Record<string, CCPUnitProfile> = {};
    let legacyDescriptor = "";

    for (const unit of competency.units) {
      const legacyProfile = raw[unit.unitCode];

      if (!isRecord(legacyProfile)) continue;

      if (!legacyDescriptor && typeof legacyProfile.descriptor === "string") {
        legacyDescriptor = legacyProfile.descriptor;
      }

      legacyUnits[unit.unitCode] = normalizeUnitProfile({
        workSteps: Array.isArray(legacyProfile.workSteps)
          ? legacyProfile.workSteps.map(String)
          : undefined,
        performanceCriteria: Array.isArray(legacyProfile.performanceCriteria)
          ? legacyProfile.performanceCriteria.map(String)
          : undefined,
        generatedAt:
          typeof legacyProfile.generatedAt === "string"
            ? legacyProfile.generatedAt
            : undefined,
      });
    }

    if (legacyDescriptor || Object.keys(legacyUnits).length > 0) {
      nextProfiles[competency.code] = {
        descriptor: legacyDescriptor,
        units: legacyUnits,
      };
    }
  }

  return nextProfiles;
}

function isUnitGenerated(profile?: CCPUnitProfile) {
  const unitProfile = normalizeUnitProfile(profile);

  return (
    unitProfile.workSteps.some(Boolean) ||
    unitProfile.performanceCriteria.some(Boolean)
  );
}

function isCompetencyGenerated(profile?: CCPCompetencyProfile) {
  const competencyProfile = normalizeCompetencyProfile(profile);

  return (
    Boolean(competencyProfile.descriptor) ||
    Object.values(competencyProfile.units).some(isUnitGenerated)
  );
}

function CCPDocumentMode({
  projectInfo,
  selectedCompetency,
  selectedProfile,
}: {
  projectInfo: ProjectInfo;
  selectedCompetency: Competency | null;
  selectedProfile: CCPCompetencyProfile;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-900">
        Construction Competency Profile (CCP)
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-black text-sm text-slate-950">
          <tbody>
            <tr>
              <th className="w-52 border border-black bg-slate-300 px-3 py-3 text-left">
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
                COCS LEVEL
              </th>
              <td className="border border-black p-0">
                <div className="grid grid-cols-[1fr_180px_1fr]">
                  <div className="px-3 py-3">
                    {LEVEL_LABELS[projectInfo.level] || projectInfo.level}
                  </div>
                  <div className="border-x border-black bg-slate-300 px-3 py-3 font-bold">
                    COCS CODE
                  </div>
                  <div className="px-3 py-3">{projectInfo.code}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-6 min-w-full border border-black text-sm text-slate-950">
          <tbody>
            <tr>
              <th className="w-52 border border-black bg-slate-300 px-3 py-3 text-left align-top">
                COMPETENCY TITLE & CODE
              </th>
              <td className="border border-black px-3 py-3">
                <div>{selectedCompetency?.title || "-"}</div>
                <div className="mt-1">{selectedCompetency?.code || "-"}</div>
              </td>
            </tr>
            <tr>
              <th className="border border-black bg-slate-300 px-3 py-3 text-left align-top">
                COMPETENCY DESCRIPTOR
              </th>
              <td className="border border-black px-3 py-3 leading-7 whitespace-pre-line">
                {selectedProfile.descriptor || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-6 min-w-full border border-black text-sm text-slate-950">
          <thead>
            <tr className="bg-slate-300">
              <th className="w-[28%] border border-black px-3 py-3">
                COMPETENCY UNIT
              </th>
              <th className="w-[32%] border border-black px-3 py-3">
                WORK STEP
              </th>
              <th className="border border-black px-3 py-3">
                PERFORMANCE CRITERIA
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedCompetency?.units.map((unit) => {
              const unitProfile = normalizeUnitProfile(
                selectedProfile.units[unit.unitCode]
              );

              return (
                <tr key={unit.unitCode}>
                  <td className="border border-black px-3 py-3 align-top">
                    <div className="font-semibold">{unit.unitTitle}</div>
                    <div className="mt-2 text-xs">{unit.unitCode}</div>
                  </td>
                  <td className="border border-black px-3 py-3 align-top">
                    {unitProfile.workSteps.some(Boolean) ? (
                      <div className="space-y-1">
                        {unitProfile.workSteps
                          .filter(Boolean)
                          .map((item, index) => (
                            <div key={`${unit.unitCode}-ws-${index}`}>{item}</div>
                          ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="border border-black px-3 py-3 align-top">
                    {unitProfile.performanceCriteria.some(Boolean) ? (
                      <div className="space-y-1">
                        {unitProfile.performanceCriteria
                          .filter(Boolean)
                          .map((item, index) => (
                            <div key={`${unit.unitCode}-pc-${index}`}>{item}</div>
                          ))}
                      </div>
                    ) : (
                      "-"
                    )}
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

function CCPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState<string | null>(null);
  const [generatingDescriptorCode, setGeneratingDescriptorCode] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [clusters, setClusters] = useState<StoredCluster[]>([]);
  const [profiles, setProfiles] = useState<CCPProfiles>({});
  const [selectedCompetencyCode, setSelectedCompetencyCode] = useState("");

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    id: "",
    code: "-",
    title: "-",
    sector: "-",
    group: "-",
    area: "-",
    level: "-",
    status: "draft",
    subarea: "-",
  });

  const clusterStorageKeys = useMemo(() => {
    if (!projectId || projectInfo.title === "-") return [];
    return getClusterStorageKeys(projectId, projectInfo.title);
  }, [projectId, projectInfo.title]);

  const profileStorageKey = useMemo(
    () => (projectId ? getProfileStorageKey(projectId) : ""),
    [projectId]
  );

  const competencies = useMemo(
    () => buildCompetenciesFromClusters(clusters),
    [clusters]
  );

  const selectedCompetency =
    competencies.find((item) => item.code === selectedCompetencyCode) ??
    competencies[0] ??
    null;

  const selectedProfile = selectedCompetency
    ? normalizeCompetencyProfile(profiles[selectedCompetency.code])
    : normalizeCompetencyProfile(EMPTY_COMPETENCY_PROFILE);

  const allUnits = competencies.flatMap((competency) => competency.units);

  const generatedUnitCount = allUnits.filter((unit) =>
    isUnitGenerated(profiles[unit.competencyCode]?.units?.[unit.unitCode])
  ).length;

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

        const target = readJson<StoredTarget>(getTargetStorageKey(projectId));
        const token = getAuthToken();

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
        console.error("Gagal load project CCP:", error);
        setErrorMessage("Gagal memuatkan maklumat projek CCP.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (clusterStorageKeys.length === 0) return;

    const savedPayload =
      clusterStorageKeys
        .map((key) => readJson<StoredClusterPayload>(key))
        .find((payload) => extractStoredClusters(payload).length > 0) ?? null;

    const nextClusters = getUsableClusters(extractStoredClusters(savedPayload));
    queueMicrotask(() => setClusters(nextClusters));
  }, [clusterStorageKeys]);

  useEffect(() => {
    if (!profileStorageKey || competencies.length === 0) return;

    const saved = readJson<unknown>(profileStorageKey);
    queueMicrotask(() => setProfiles(normalizeProfiles(saved, competencies)));
  }, [competencies, profileStorageKey]);

  useEffect(() => {
    if (!selectedCompetencyCode && competencies.length > 0) {
      queueMicrotask(() => setSelectedCompetencyCode(competencies[0].code));
    }
  }, [competencies, selectedCompetencyCode]);

  function persistProfiles(nextProfiles: CCPProfiles) {
    setProfiles(nextProfiles);

    if (profileStorageKey) {
      window.localStorage.setItem(profileStorageKey, JSON.stringify(nextProfiles));
    }
  }

  function buildNextProfile(
    competencyCode: string,
    updater: (profile: CCPCompetencyProfile) => CCPCompetencyProfile
  ) {
    return {
      ...profiles,
      [competencyCode]: updater(
        normalizeCompetencyProfile(profiles[competencyCode])
      ),
    };
  }

  function updateDescriptor(value: string) {
    if (!selectedCompetency) return;

    persistProfiles(
      buildNextProfile(selectedCompetency.code, (profile) => ({
        ...profile,
        descriptor: value,
      }))
    );
  }

  function updateUnitWorkSteps(unitCode: string, value: string) {
    if (!selectedCompetency) return;

    persistProfiles(
      buildNextProfile(selectedCompetency.code, (profile) => ({
        ...profile,
        units: {
          ...profile.units,
          [unitCode]: {
            ...normalizeUnitProfile(profile.units[unitCode]),
            workSteps: splitMultiline(value),
          },
        },
      }))
    );
  }

  function updateUnitPerformanceCriteria(unitCode: string, value: string) {
    if (!selectedCompetency) return;

    persistProfiles(
      buildNextProfile(selectedCompetency.code, (profile) => ({
        ...profile,
        units: {
          ...profile.units,
          [unitCode]: {
            ...normalizeUnitProfile(profile.units[unitCode]),
            performanceCriteria: splitMultiline(value),
          },
        },
      }))
    );
  }

  function clearUnitProfile(unit: CompetencyUnit) {
    const confirmClear = window.confirm(
      `Kosongkan Work Step dan Performance Criteria untuk "${unit.unitTitle}"?`
    );

    if (!confirmClear) return;

    persistProfiles(
      buildNextProfile(unit.competencyCode, (profile) => {
        const nextUnits = { ...profile.units };
        delete nextUnits[unit.unitCode];

        return {
          ...profile,
          units: nextUnits,
        };
      })
    );
  }

  async function requestAIProfile(unit: CompetencyUnit) {
    const parentCompetency = competencies.find(
      (competency) => competency.code === unit.competencyCode
    );

    const unitIndex =
      parentCompetency?.units.findIndex(
        (item) => item.unitCode === unit.unitCode
      ) ?? -1;

    const unitSequence = unitIndex >= 0 ? unitIndex + 1 : 1;
    
    const res = await fetch("/api/ccp/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        section: projectInfo.sector,
        group: projectInfo.group,
        area: projectInfo.area,
        cocsTitle: projectInfo.title,
        cocsLevel: LEVEL_LABELS[projectInfo.level] || projectInfo.level,
        competencyTitle: unit.competencyTitle,
        competencyCode: unit.competencyCode,
        competencyUnit: unit.unitTitle,
        competencyUnitCode: unit.unitCode,
        unitSequence,
      }),
    });

    const responseText = await res.text();

    if (!res.ok) {
      throw new Error(responseText || "Gagal menjana CCP menggunakan AI.");
    }

    const parsed = JSON.parse(responseText) as Partial<CCPGenerateResult>;

    const workSteps = normalizeList(parsed.workSteps);
    const performanceCriteria = normalizeList(parsed.performanceCriteria);

    if (
      JSON.stringify(workSteps.map((item) => item.toLowerCase())) ===
      JSON.stringify(performanceCriteria.map((item) => item.toLowerCase()))
    ) {
      throw new Error(
        "AI memulangkan Performance Criteria yang sama dengan Work Step."
      );
    }

    return {
      descriptor: cleanText(parsed.descriptor),
      workSteps,
      performanceCriteria,
      generatedAt: parsed.generatedAt ?? new Date().toISOString(),
    };
  }

async function requestAIDescriptor(competency: Competency) {
  const res = await fetch("/api/ccp/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      section: projectInfo.sector,
      group: projectInfo.group,
      area: projectInfo.area,
      cocsTitle: projectInfo.title,
      cocsLevel: LEVEL_LABELS[projectInfo.level] || projectInfo.level,
      competencyTitle: competency.title,
      competencyCode: competency.code,
      competencyUnits: competency.units.map((unit) => unit.unitTitle),
      generationScope: "descriptor",
    }),
  });

  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(responseText || "Gagal menjana Competency Descriptor.");
  }

  const generated = JSON.parse(responseText) as Partial<
    CCPGenerateResult & {
      activityScope?: string;
      outcome?: string;
    }
  >;

  if (generated.descriptor) {
    return generated.descriptor;
  }

  const activityScope = generated.activityScope || "";
  const outcome = generated.outcome || "";
  const competencyUnits = competency.units
    .map((unit) => unit.unitTitle.toLowerCase())
    .join(", ");

  if (activityScope || outcome) {
    return `${competency.title} describes the activities required to ${activityScope}

The person who is competent in this competency should be able to ${competencyUnits}.

The outcome of this competency is ${outcome}`;
  }

  throw new Error("AI tidak memulangkan Competency Descriptor.");
}

async function generateDescriptor() {
  if (!selectedCompetency) return;

  try {
    setGeneratingDescriptorCode(selectedCompetency.code);
    setErrorMessage("");

    const descriptor = await requestAIDescriptor(selectedCompetency);

    if (!descriptor) {
      throw new Error("AI tidak memulangkan Competency Descriptor.");
    }

    persistProfiles(
      buildNextProfile(selectedCompetency.code, (profile) => ({
        ...profile,
        descriptor,
        generatedAt: new Date().toISOString(),
      }))
    );

    setMessage("Competency Descriptor berjaya dijana.");
    setTimeout(() => setMessage(""), 2500);
  } catch (error) {
    console.error("Gagal jana descriptor:", error);
    setErrorMessage("Gagal menjana Competency Descriptor. Sila semak API AI.");
  } finally {
    setGeneratingDescriptorCode(null);
  }
}

  async function generateUnit(unit: CompetencyUnit) {
    try {
      setGeneratingCode(unit.unitCode);
      setErrorMessage("");

      const generated = await requestAIProfile(unit);

      persistProfiles(
        buildNextProfile(unit.competencyCode, (profile) => ({
          ...profile,
          units: {
            ...profile.units,
            [unit.unitCode]: normalizeUnitProfile({
              workSteps: generated.workSteps,
              performanceCriteria: generated.performanceCriteria,
              generatedAt: generated.generatedAt,
            }),
          },
          generatedAt: new Date().toISOString(),
        }))
      );

      setMessage(
        `Work Step dan Performance Criteria berjaya dijana untuk ${unit.unitCode}.`
      );
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Gagal jana WA:", error);
      setErrorMessage(
        "Gagal menjana Work Step dan Performance Criteria. Sila semak API AI."
      );
    } finally {
      setGeneratingCode(null);
    }
}

  async function generateSelectedCompetency() {
    if (!selectedCompetency) return;

    try {
      setErrorMessage("");
      let nextProfiles = { ...profiles };
      let descriptor = normalizeCompetencyProfile(
        nextProfiles[selectedCompetency.code]
      ).descriptor;

      for (const unit of selectedCompetency.units) {
        setGeneratingCode(unit.unitCode);

        const generated = await requestAIProfile(unit);
        if (!descriptor) descriptor = generated.descriptor;

        const currentProfile = normalizeCompetencyProfile(
          nextProfiles[selectedCompetency.code]
        );

        nextProfiles = {
          ...nextProfiles,
          [selectedCompetency.code]: {
            ...currentProfile,
            descriptor,
            units: {
              ...currentProfile.units,
              [unit.unitCode]: normalizeUnitProfile({
                workSteps: generated.workSteps,
                performanceCriteria: generated.performanceCriteria,
                generatedAt: generated.generatedAt,
              }),
            },
            generatedAt: new Date().toISOString(),
          },
        };

        persistProfiles(nextProfiles);
      }

      setMessage("Semua WA untuk CC terpilih berjaya dijana.");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Gagal jana CC:", error);
      setErrorMessage("Gagal menjana semua WA untuk CC terpilih.");
    } finally {
      setGeneratingCode(null);
    }
  }

  async function generateAllCompetencies() {
    if (competencies.length === 0) return;

    try {
      setErrorMessage("");
      let nextProfiles = { ...profiles };

      for (const competency of competencies) {
        let descriptor = normalizeCompetencyProfile(
          nextProfiles[competency.code]
        ).descriptor;

        for (const unit of competency.units) {
          setGeneratingCode(unit.unitCode);

          const generated = await requestAIProfile(unit);
          if (!descriptor) descriptor = generated.descriptor;

          const currentProfile = normalizeCompetencyProfile(
            nextProfiles[competency.code]
          );

          nextProfiles = {
            ...nextProfiles,
            [competency.code]: {
              ...currentProfile,
              descriptor,
              units: {
                ...currentProfile.units,
                [unit.unitCode]: normalizeUnitProfile({
                  workSteps: generated.workSteps,
                  performanceCriteria: generated.performanceCriteria,
                  generatedAt: generated.generatedAt,
                }),
              },
              generatedAt: new Date().toISOString(),
            },
          };

          persistProfiles(nextProfiles);
        }
      }

      setMessage("Semua maklumat CCP berjaya dijana.");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Gagal jana semua CCP:", error);
      setErrorMessage("Gagal menjana semua CCP. Cuba jana satu CC dahulu.");
    } finally {
      setGeneratingCode(null);
    }
  }

  function saveDraft() {
    persistProfiles(profiles);
    setMessage("Draf CCP berjaya disimpan.");
    setTimeout(() => setMessage(""), 2500);
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
          <span className="font-medium text-slate-700">
            Competency Profile (CCP)
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Info size={20} />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Competency Profile (CCP)
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Lengkapkan descriptor, Work Step dan Performance Criteria
                berdasarkan hasil CCPC.
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
          <p className="text-sm text-slate-500">Section</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.sector}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Group</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.group}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Area</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {loading ? "Memuatkan..." : projectInfo.area}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">COCS Level</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {LEVEL_LABELS[projectInfo.level] || projectInfo.level}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Unit Dijana</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {generatedUnitCount}/{allUnits.length}
          </p>
        </div>
      </div>

      {competencies.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-800">
          Tiada Competency Unit ditemui. Sila kembali ke CCPC, jalankan AI
          Clustering dan finalise cluster terlebih dahulu.
          <div className="mt-4">
            <Link
              href={`/ccpc?projectId=${projectId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ArrowLeft size={16} />
              Kembali ke CCPC
            </Link>
          </div>
        </div>
      ) : viewMode === "document" ? (
        <CCPDocumentMode
          projectInfo={projectInfo}
          selectedCompetency={selectedCompetency}
          selectedProfile={selectedProfile}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-blue-700">
                Senarai Competency
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dipindahkan daripada cluster CCPC. Pilih CC untuk melihat semua
                WA di bawahnya.
              </p>
            </div>

            <div className="max-h-[680px] space-y-2 overflow-y-auto p-4">
              {competencies.map((competency) => {
                const active = selectedCompetency?.code === competency.code;
                const generated = isCompetencyGenerated(profiles[competency.code]);

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
                      {generated ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          AI siap
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      {competency.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {competency.units.length} Work Activity
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-blue-700">
                  Workspace Competency
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCompetency?.code} - {selectedCompetency?.title}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Save size={16} />
                  Simpan Draf
                </button>
              </div>

            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <FileCheck2 size={18} className="mt-0.5 text-blue-700" />
                  <div className="text-sm leading-6 text-slate-600">
                    COMPETENCY TITLE, CODE dan COMPETENCY UNIT dibawa daripada
                    CCPC. Descriptor, Work Step dan Performance Criteria boleh
                    dijana oleh AI dan disemak semula oleh fasilitator.
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
                        COMPETENCY DESCRIPTOR
                      </th>
                      <td className="border border-slate-300 px-4 py-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-700">
                            Descriptor untuk {selectedCompetency?.code || "-"}
                          </p>

                          <button
                            type="button"
                            onClick={generateDescriptor}
                            disabled={!selectedCompetency || Boolean(generatingDescriptorCode)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                          >
                            <Sparkles size={14} />
                            {generatingDescriptorCode === selectedCompetency?.code
                              ? "Menjana..."
                              : "Jana AI Descriptor"}
                          </button>
                        </div>

                        <textarea
                          value={selectedProfile.descriptor}
                          onChange={(event) => updateDescriptor(event.target.value)}
                          rows={5}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="Descriptor akan dijana oleh AI atau boleh diisi secara manual."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-300">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-slate-700">
                      <th className="w-[28%] border border-slate-300 px-4 py-3">
                        COMPETENCY UNIT
                      </th>
                      <th className="w-[31%] border border-slate-300 px-4 py-3">
                        WORK STEP
                      </th>
                      <th className="w-[31%] border border-slate-300 px-4 py-3">
                        PERFORMANCE CRITERIA
                      </th>
                      <th className="w-36 border border-slate-300 px-4 py-3 text-center">
                        Tindakan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompetency?.units.map((unit) => {
                      const unitProfile = normalizeUnitProfile(
                        selectedProfile.units[unit.unitCode]
                      );

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
                              value={unitProfile.workSteps.join("\n")}
                              onChange={(event) =>
                                updateUnitWorkSteps(
                                  unit.unitCode,
                                  event.target.value
                                )
                              }
                              rows={6}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                              placeholder="Jana atau masukkan Work Step..."
                            />
                          </td>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <textarea
                              value={unitProfile.performanceCriteria.join("\n")}
                              onChange={(event) =>
                                updateUnitPerformanceCriteria(
                                  unit.unitCode,
                                  event.target.value
                                )
                              }
                              rows={6}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                              placeholder="Jana atau masukkan Performance Criteria..."
                            />
                          </td>
                          <td className="border border-slate-300 px-4 py-3 align-top">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => generateUnit(unit)}
                                disabled={Boolean(generatingCode) || Boolean(generatingDescriptorCode)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                              >
                                <Sparkles size={14} />
                                {generatingCode === unit.unitCode
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/ccpc?projectId=${projectId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Kembali ke CCPC
        </Link>

        <Link
          href={`/csp?projectId=${projectId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Seterusnya: CSP
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function CCPPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Memuatkan halaman CCP...
        </div>
      }
    >
      <CCPPageContent />
    </Suspense>
  );
}
