"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Info,
  Plus,
  Save,
  Trash2,
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

type PanelCard = {
  panel_name?: string;
  panel_position?: string;
  panel_organization?: string;
};

type CompetencySummary = {
  code: string;
  title: string;
  units: {
    code: string;
    title: string;
  }[];
};

type ProjectAssignment = {
  id: number;
  project_id: number;
  user_id: number;
  assignment_role: string;
  status?: string;
};

type UserSummary = {
  id: number;
  name: string;
  role?: string;
  organization?: string;
  status?: string;
};

type CommitteeMember = {
  name: string;
  organization: string;
  role: string;
};

type CommitteeRow = {
  left: string;
  right: string;
};

type StandardDevelopmentCommittee = {
  committee: CommitteeRow[];
  secretariat: CommitteeRow[];
  facilitator: CommitteeRow[];
};

type CSPBuilderSectionKind = "manual" | "auto" | "fixed";

type CSPBuilderSectionDetail = {
  title: string;
  description: string;
  kind: CSPBuilderSectionKind;
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
const CSP_BUILDER_SECTION_DETAILS: Record<string, CSPBuilderSectionDetail> = {
  prakata: {
    title: "Prakata",
    description: "Bahagian ini menggunakan teks tetap daripada format CSP.",
    kind: "fixed",
  },
  abbreviation: {
    title: "Abbreviation",
    description:
      "Senarai abbreviation boleh dijana automatik daripada kandungan dokumen.",
    kind: "auto",
  },
  glossary: {
    title: "Glossary",
    description:
      "Senarai glossary boleh dijana automatik daripada istilah penting dalam dokumen.",
    kind: "auto",
  },
  figures: {
    title: "List of Figure",
    description:
      "Senarai rajah boleh dijana automatik daripada rajah yang wujud dalam dokumen.",
    kind: "auto",
  },
  acknowledgement: {
    title: "Acknowledgement",
    description: "Bahagian ini menggunakan teks tetap daripada format CSP.",
    kind: "fixed",
  },
  "1": {
    title: "1. Introduction",
    description: "Lengkapkan seksyen pengenalan bagi dokumen CSP.",
    kind: "manual",
  },
  "1.1": {
    title: "1.1 Industry Overview",
    description: "Huraikan gambaran industri berkaitan pekerjaan sasaran.",
    kind: "manual",
  },
  "1.2": {
    title: "1.2 Occupational Definition",
    description: "Takrifkan pekerjaan sasaran mengikut skop kerja dan tahap.",
    kind: "manual",
  },
  "1.3": {
    title: "1.3 Occupational Scope",
    description: "Nyatakan skop kerja utama bagi pekerjaan sasaran.",
    kind: "manual",
  },
  "1.4": {
    title: "1.4 Working Condition",
    description: "Terangkan keadaan kerja, persekitaran dan keperluan kerja.",
    kind: "manual",
  },
  "1.5": {
    title: "1.5 Employment Prospects",
    description: "Huraikan prospek pekerjaan dan permintaan industri.",
    kind: "manual",
  },
  "1.6": {
    title: "1.6 Up Skilling Opportunities",
    description: "Huraikan peluang peningkatan kemahiran dan laluan kerjaya.",
    kind: "manual",
  },
  "2": {
    title: "2. COCS Development Scope",
    description: "Lengkapkan skop pembangunan COCS.",
    kind: "manual",
  },
  "2.1": {
    title: "2.1 Rationale of COCS Development",
    description: "Jelaskan rasional pembangunan standard COCS ini.",
    kind: "manual",
  },
  "2.2": {
    title: "2.2 Construction Occupational Structure (COS)",
    description: "Bahagian ini diambil automatik daripada modul COS.",
    kind: "auto",
  },
  "2.3": {
    title: "2.3 Rationale of Construction Occupational Structure",
    description: "Jelaskan rasional struktur pekerjaan yang dibangunkan.",
    kind: "manual",
  },
  "2.4": {
    title: "2.4 Regulatory/Statutory Body Requirements Related to Occupation",
    description: "Senaraikan keperluan badan kawalselia atau statutori.",
    kind: "manual",
  },
  "2.5": {
    title: "2.5 Occupational Prerequisite",
    description: "Nyatakan prasyarat pekerjaan, kelayakan atau pengalaman asas.",
    kind: "manual",
  },
  "3": {
    title: "3. Definition of Competency Levels",
    description: "Bahagian ini menggunakan teks tetap daripada format CSP.",
    kind: "fixed",
  },
  "4": {
    title: "4. Occupational Competencies",
    description: "Bahagian ini diambil automatik daripada hasil CCPC.",
    kind: "auto",
  },
  "5": {
    title: "5. Organisation Reference for Sources of Additional Information",
    description: "Lengkapkan organisasi rujukan tambahan untuk dokumen CSP.",
    kind: "manual",
  },
  "6": {
    title: "6. Standard Technical Evaluation Committee",
    description: "Lengkapkan maklumat jawatankuasa penilaian teknikal.",
    kind: "manual",
  },
  "7": {
    title: "7. Standard Development Committee",
    description: "Bahagian ini boleh diambil daripada tugasan pengguna projek.",
    kind: "auto",
  },
};

function formatLevel(level: string) {
  return level && level !== "-" ? `Tahap ${level}` : "-";
}

function getDefaultCSPSectionContent(
  sectionNo: string,
  detail: CSPBuilderSectionDetail,
  standardTitle: string,
  standardLevel: string,
  careerPath: string
) {
  const defaultAbbreviations: CommitteeRow[] = [
    { left: "CIDB", right: "Construction Industry Development Board" },
    { left: "COCS", right: "Construction Occupational Competency Standard" },
    { left: "COS", right: "Construction Occupational Structure" },
    { left: "CCPC", right: "Construction Competency Profile Chart" },
    { left: "CCP", right: "Construction Competency Profile" },
    { left: "CSP", right: "Construction Standard Practice" },
    { left: "CSQF", right: "Construction Skills Qualification Framework" },
  ];
  const defaultGlossary: CommitteeRow[] = [
    {
      left: "Competency",
      right: "Keupayaan untuk melaksanakan kerja mengikut standard yang ditetapkan.",
    },
    {
      left: "Occupational Structure",
      right: "Struktur pekerjaan yang menunjukkan laluan kerjaya dan tahap kompetensi.",
    },
    {
      left: "Standard Practice",
      right: "Amalan standard yang menjadi rujukan pelaksanaan kerja.",
    },
  ];

  if (sectionNo === "prakata") {
    return [
      "Dokumen Standard Practice ini dibangunkan sebagai panduan kepada pihak berkepentingan dalam melaksanakan dan menilai kompetensi pekerjaan pembinaan berdasarkan Construction Occupational Competency Standard (COCS).",
      "Dokumen ini hendaklah digunakan bersama maklumat COS, CCPC dan CCP yang telah dibangunkan bagi memastikan kandungan standard adalah selaras dengan keperluan industri.",
    ].join("\n\n");
  }

  if (sectionNo === "abbreviation") {
    return stringifyCommitteeRows(defaultAbbreviations);
  }

  if (sectionNo === "glossary") {
    return stringifyCommitteeRows(defaultGlossary);
  }

  if (sectionNo === "figures") {
    return "Figure 1: Construction Occupational Structure (COS)";
  }

  if (sectionNo === "acknowledgement") {
    return [
      "CIDB Malaysia merakamkan penghargaan kepada semua ahli jawatankuasa, fasilitator, panel industri dan pihak berkepentingan yang terlibat dalam pembangunan dokumen ini.",
      "Sumbangan kepakaran, masa dan maklum balas yang diberikan telah membantu memastikan dokumen ini memenuhi keperluan industri pembinaan.",
    ].join("\n\n");
  }

  if (sectionNo === "3") {
    return [
      "The COCS is developed for various occupational areas. Below is a guideline of each COCS Level as defined by the Construction Skills Qualification Framework (CSQF).",
      "Level 1: This level qualifies individuals who are competent with basic general and foundation knowledge and skills in a narrow range of areas of a field of work or learning in the construction industry and/or its respective sectors with close supervision.",
      "Level 2: This level qualifies individuals who are competent with basic factual or operational knowledge and skills in a selected number of areas of a field of work or learning in the construction industry and/or its respective sectors, and with limited autonomy and judgments to complete routine but variable tasks under the observation of supervisors.",
      "Level 3: This level qualifies individuals who are competent with broad operational and theoretical knowledge and skills of a field of work or learning in the construction industry and/or its respective sectors and perform clearly defined but limited responsibility in varied contexts to undertake skilled work.",
      "Level 4: This level qualifies individuals who competent with a broad knowledge base with some specialised knowledge and skills of a field of work or learning in the construction industry and/or its respective sectors, and with initiative and judgment to organise the work of self and others and plan, coordinate and evaluate the work of teams within broad but generally well-defined parameters.",
      "Level 5: This level qualifies individuals who are competent in applying an integrated technical and theoretical concept in a broad range of contexts in the construction industry and/or its respective sectors to undertake advanced skilled or professional work and with initiative and judgment to organise the work of self and others and plan, coordinate and evaluate the work of teams within broad but generally specialised parameters.",
      "Level 6: This level qualifies individuals who are competent in applying a specialised knowledge in a range of environment to undertake advanced skilled or professional work and across a broad range of technical or management functions and systematically and effectively resolve complicated and unpredictable issues.",
    ].join("\n");
  }

  if (detail.kind === "manual") {
    return `${detail.title} bagi ${standardTitle} ${formatLevel(
      standardLevel
    )} dalam ${careerPath}.`;
  }

  return detail.description;
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

function parseCompetencyLevelContent(content: string) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    introduction: lines[0] || "",
    levels: lines.slice(1).map((line) => {
      const [label, ...descriptionParts] = line.split(":");

      return {
        label: label.trim(),
        description: descriptionParts.join(":").trim(),
      };
    }),
  };
}

function createEmptyCommitteeRows(count: number): CommitteeRow[] {
  return Array.from({ length: count }, () => ({ left: "", right: "" }));
}

function parseCommitteeRows(value?: string, count = 4): CommitteeRow[] {
  if (!value) return createEmptyCommitteeRows(count);

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) return createEmptyCommitteeRows(count);

    return parsed.map((row) => {
      if (!isRecord(row)) return { left: "", right: "" };

      return {
        left: String(row.left ?? ""),
        right: String(row.right ?? ""),
      };
    });
  } catch {
    return createEmptyCommitteeRows(count);
  }
}

function stringifyCommitteeRows(rows: CommitteeRow[]) {
  return JSON.stringify(rows);
}

function parseDevelopmentCommittee(
  value?: string
): StandardDevelopmentCommittee {
  const fallback = {
    committee: createEmptyCommitteeRows(10),
    secretariat: createEmptyCommitteeRows(4),
    facilitator: createEmptyCommitteeRows(1),
  };

  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed)) return fallback;

    return {
      committee: Array.isArray(parsed.committee)
        ? parseCommitteeRows(JSON.stringify(parsed.committee), 10)
        : fallback.committee,
      secretariat: Array.isArray(parsed.secretariat)
        ? parseCommitteeRows(JSON.stringify(parsed.secretariat), 4)
        : fallback.secretariat,
      facilitator: Array.isArray(parsed.facilitator)
        ? parseCommitteeRows(JSON.stringify(parsed.facilitator), 1)
        : fallback.facilitator,
    };
  } catch {
    return fallback;
  }
}

function stringifyDevelopmentCommittee(data: StandardDevelopmentCommittee) {
  return JSON.stringify(data);
}

function buildDevelopmentCommitteeFromMembers(
  members: CommitteeMember[],
  facilitators: CommitteeMember[] = [],
  current?: StandardDevelopmentCommittee
): StandardDevelopmentCommittee {
  return {
    committee:
      members.length > 0
        ? members.map((member) => ({
            left: member.name,
            right: `${member.organization} - ${member.role}`,
          }))
        : current?.committee || createEmptyCommitteeRows(1),
    secretariat: current?.secretariat || createEmptyCommitteeRows(1),
    facilitator:
      facilitators.length > 0
        ? facilitators.map((member) => ({
            left: member.name,
            right: `${member.organization} - ${member.role}`,
          }))
        : current?.facilitator || createEmptyCommitteeRows(1),
  };
}

function formatCommitteeRole(role: string) {
  const labels: Record<string, string> = {
    PROJECT_MANAGER: "Project Manager",
    FACILITATOR: "Facilitator",
    ASSESSOR: "Assessor",
    SUPER_ADMIN: "Super Admin",
  };

  return labels[role] || role.replace(/_/g, " ");
}

function hasFilledRow(rows: CommitteeRow[]) {
  return rows.some((row) => row.left.trim() && row.right.trim());
}

function getCSPMissingItems(params: {
  isSaved: boolean;
  competenciesCount: number;
  technicalRows: CommitteeRow[];
  developmentCommittee: StandardDevelopmentCommittee;
}) {
  const missing: string[] = [];

  if (params.competenciesCount === 0) {
    missing.push("Occupational Competencies belum tersedia daripada CCPC/CCP.");
  }

  if (!hasFilledRow(params.technicalRows)) {
    missing.push(
      "Bahagian 6: Standard Technical Evaluation Committee perlukan sekurang-kurangnya satu nama dan organisasi/peranan."
    );
  }

  if (!hasFilledRow(params.developmentCommittee.committee)) {
    missing.push(
      "Bahagian 7: Committee Members perlukan sekurang-kurangnya satu nama dan organisasi/peranan."
    );
  }

  if (!hasFilledRow(params.developmentCommittee.secretariat)) {
    missing.push(
      "Bahagian 7: Secretariat perlukan sekurang-kurangnya satu nama dan organisasi/peranan."
    );
  }

  if (!hasFilledRow(params.developmentCommittee.facilitator)) {
    missing.push(
      "Bahagian 7: Facilitator perlukan sekurang-kurangnya satu nama dan organisasi/peranan."
    );
  }

  if (!params.isSaved) {
    missing.push("Klik Save selepas semua maklumat dikemaskini.");
  }

  return missing;
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
  committeeMembers,
  cspSections,
}: {
  projectInfo: ProjectInfo;
  standardTitle: string;
  standardLevel: string;
  careerPath: string;
  matrix: COSMatrix | null;
  competencies: CompetencySummary[];
  committeeMembers: CommitteeMember[];
  cspSections: Record<string, string>;
}) {
  const contentItems = [
    "Prakata",
    "Abbreviation",
    "Glossary",
    "List of Figure",
    "Acknowledgement",
    "1. Introduction",
    "2. COCS Development Scope",
    "3. Definition of Competency Levels",
    "4. Occupational Competencies",
    "5. Organisation Reference for Sources of Additional Information",
    "6. Standard Technical Evaluation Committee",
    "7. Standard Development Committee",
  ];

  const renderSavedSection = (sectionNo: string) => {
    const detail = CSP_BUILDER_SECTION_DETAILS[sectionNo];

    if (!detail) return null;

    const defaultContent = getDefaultCSPSectionContent(
      sectionNo,
      detail,
      standardTitle,
      standardLevel,
      careerPath
    );
    const content =
      sectionNo === "3" ? defaultContent : cspSections[sectionNo]?.trim() || defaultContent;

    if (sectionNo === "abbreviation" || sectionNo === "glossary") {
      const rows = parseCommitteeRows(content, sectionNo === "abbreviation" ? 7 : 3);

      return (
        <section className="border border-slate-300 p-6">
          <h2 className="text-center text-lg font-bold text-slate-900">
            {detail.title}
          </h2>
          <table className="mt-5 w-full border border-black text-sm text-black">
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${sectionNo}-doc-row-${index}`}>
                  <td className="w-16 border border-black px-3 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="w-44 border border-black px-3 py-2 font-semibold text-red-600">
                    {row.left}
                  </td>
                  <td className="border border-black px-3 py-2 text-red-600">
                    {row.right}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    }

    if (sectionNo === "3") {
      const competencyLevels = parseCompetencyLevelContent(content);

      return (
        <section className="border border-slate-300 p-6">
          <h2 className="text-lg font-bold text-slate-900">{detail.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-900">
            {competencyLevels.introduction}
          </p>

          <div className="mt-5 space-y-5 text-sm leading-6 text-slate-900">
            {competencyLevels.levels.map((level) => (
              <div
                key={level.label}
                className="grid max-w-4xl grid-cols-[90px_minmax(0,1fr)] gap-4"
              >
                <div>
                  {level.label === "Level 6" ? level.label : `${level.label}:`}
                </div>
                <div>{level.description}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">{detail.title}</h2>
        <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-900">
          {content}
        </div>
      </section>
    );
  };

  const renderTwoColumnRows = (rows: CommitteeRow[]) =>
    rows.map((row, index) => (
      <tr key={`committee-row-${index}`}>
        <td className="h-9 border border-black px-3 py-2">{row.left}</td>
        <td className="h-9 border border-black px-3 py-2">{row.right}</td>
      </tr>
    ));

  const technicalCommitteeRows = parseCommitteeRows(cspSections["6"], 4);
  const savedDevelopmentCommittee = parseDevelopmentCommittee(cspSections["7"]);
  const developmentCommittee =
    !cspSections["7"]?.trim() && committeeMembers.length > 0
      ? {
          ...savedDevelopmentCommittee,
          committee: committeeMembers.map((member) => ({
            left: member.name,
            right: `${member.organization} - ${member.role}`,
          })),
        }
      : savedDevelopmentCommittee;

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <section className="min-h-[520px] border border-slate-300 p-8 text-center">
        <div className="mt-24 text-xl font-bold uppercase text-slate-900">
          Construction Occupational Competency Standard
        </div>
        <div className="mt-12 text-2xl font-bold uppercase text-slate-900">
          {standardTitle}
        </div>
        <div className="mt-3 text-lg font-semibold uppercase text-slate-700">
          {careerPath}
        </div>
        <div className="mt-10 text-xl font-bold uppercase text-slate-900">
          {formatLevel(standardLevel)}
        </div>
      </section>

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
        <h2 className="text-center text-lg font-bold text-slate-900">
          Kandungan
        </h2>
        <div className="mt-6 space-y-2 text-sm leading-6 text-slate-900">
          {contentItems.map((item, index) => (
            <div key={`csp-toc-${item}`} className="flex gap-4">
              <span className="w-8 text-right">{index + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {[
        "prakata",
        "abbreviation",
        "glossary",
        "figures",
        "acknowledgement",
      ].map((sectionNo) => (
        <div key={`csp-doc-saved-${sectionNo}`}>
          {renderSavedSection(sectionNo)}
        </div>
      ))}

      <section className="min-h-[260px] border border-slate-300 p-8 text-center">
        <div className="mt-20 text-2xl font-bold uppercase tracking-wide text-slate-900">
          Standard Practice
        </div>
      </section>

      {[
        "1",
        "1.1",
        "1.2",
        "1.3",
        "1.4",
        "1.5",
        "1.6",
        "2",
        "2.1",
      ].map((sectionNo) => (
        <div key={`csp-doc-saved-${sectionNo}`}>
          {renderSavedSection(sectionNo)}
        </div>
      ))}

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

      {["2.3", "2.4", "2.5", "3"].map((sectionNo) => (
        <div key={`csp-doc-saved-${sectionNo}`}>
          {renderSavedSection(sectionNo)}
        </div>
      ))}

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

        {cspSections["5"]?.trim() ? (
          <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-900">
            {cspSections["5"].trim()}
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              The following organisations can be referred as sources of
              additional information which can assist in defining the
              document&apos;s contents.
            </p>

            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-900">
              {ORGANISATION_REFERENCES.map(
                (organisation, organisationIndex) => (
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
                        <div
                          key={`csp-organisation-${organisation.name}-${lineIndex}`}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </section>

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          6. Standard Technical Evaluation Committee
        </h2>

        <table className="mt-5 w-[520px] max-w-full border border-black text-sm text-black">
          <tbody>{renderTwoColumnRows(technicalCommitteeRows)}</tbody>
        </table>
      </section>

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          7. Standard Development Committee
        </h2>

        <div className="mt-4 text-center text-lg uppercase text-slate-900">
          {careerPath}
        </div>
        <div className="mt-2 text-center text-lg uppercase text-slate-900">
          {formatLevel(standardLevel)}
        </div>

        <table className="mt-4 w-full border border-black text-sm text-black">
          <tbody>
            {renderTwoColumnRows(developmentCommittee.committee)}
            <tr>
              <td
                colSpan={2}
                className="border border-black px-3 py-2 text-center text-lg uppercase"
              >
                Secretariat
              </td>
            </tr>
            {renderTwoColumnRows(developmentCommittee.secretariat)}
            <tr>
              <td
                colSpan={2}
                className="border border-black px-3 py-2 text-center text-lg uppercase"
              >
                Facilitator
              </td>
            </tr>
            {renderTwoColumnRows(developmentCommittee.facilitator)}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function CSPCommitteeTableEditor({
  title,
  description,
  content,
  onContentChange,
}: {
  title: string;
  description: string;
  content?: string;
  onContentChange: (content: string) => void;
}) {
  const rows = parseCommitteeRows(content, 4);

  function updateRow(index: number, key: keyof CommitteeRow, value: string) {
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [key]: value } : row
    );
    onContentChange(stringifyCommitteeRows(nextRows));
  }

  function addRow() {
    onContentChange(stringifyCommitteeRows([...rows, { left: "", right: "" }]));
  }

  function deleteRow(index: number) {
    onContentChange(stringifyCommitteeRows(rows.filter((_, i) => i !== index)));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-blue-700">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          <Plus size={16} />
          Tambah Baris
        </button>
      </div>

      <div className="space-y-3 p-6">
        {rows.map((row, index) => (
          <div
            key={`committee-editor-${index}`}
            className="grid grid-cols-[1fr_1fr_auto] gap-3"
          >
            <input
              value={row.left}
              onChange={(event) => updateRow(index, "left", event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder="Nama / jawatan"
            />
            <input
              value={row.right}
              onChange={(event) =>
                updateRow(index, "right", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder="Organisasi / peranan"
            />
            <button
              type="button"
              onClick={() => deleteRow(index)}
              className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
              title="Padam baris"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CSPTermTableEditor({
  sectionNo,
  title,
  description,
  content,
  onContentChange,
  documentContext,
}: {
  sectionNo: "abbreviation" | "glossary";
  title: string;
  description: string;
  content?: string;
  onContentChange: (content: string) => void;
  documentContext: string;
}) {
  const defaultContent = getDefaultCSPSectionContent(
    sectionNo,
    CSP_BUILDER_SECTION_DETAILS[sectionNo],
    "",
    "",
    ""
  );
  const rows = parseCommitteeRows(
    content || defaultContent,
    sectionNo === "abbreviation" ? 7 : 3
  );
  const [isGenerating, setIsGenerating] = useState(false);

  function updateRow(index: number, key: keyof CommitteeRow, value: string) {
    onContentChange(
      stringifyCommitteeRows(
        rows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, [key]: value } : row
        )
      )
    );
  }

  function addRow() {
    onContentChange(stringifyCommitteeRows([...rows, { left: "", right: "" }]));
  }

  function deleteRow(index: number) {
    onContentChange(stringifyCommitteeRows(rows.filter((_, i) => i !== index)));
  }

  async function handleGenerate() {
    try {
      setIsGenerating(true);

      const res = await fetch("/api/csp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionTitle: title,
          sectionDescription: description,
          generationType: sectionNo,
          documentContext,
        }),
      });

      if (!res.ok) throw new Error("Gagal menjana jadual.");

      const data = (await res.json()) as { rows?: CommitteeRow[] };

      if (Array.isArray(data.rows) && data.rows.length > 0) {
        onContentChange(stringifyCommitteeRows(data.rows));
      }
    } catch (error) {
      console.error("Gagal jana jadual CSP:", error);
      alert("Gagal menjana jadual CSP.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-blue-700">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Plus size={16} />
            Tambah Baris
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isGenerating ? "Menjana..." : "Jana AI"}
          </button>
        </div>
      </div>

      <div className="space-y-3 p-6">
        {rows.map((row, index) => (
          <div
            key={`${sectionNo}-editor-${index}`}
            className="grid grid-cols-[0.7fr_1.4fr_auto] gap-3"
          >
            <input
              value={row.left}
              onChange={(event) => updateRow(index, "left", event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder={sectionNo === "abbreviation" ? "Singkatan" : "Istilah"}
            />
            <input
              value={row.right}
              onChange={(event) =>
                updateRow(index, "right", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder={
                sectionNo === "abbreviation" ? "Maksud" : "Definisi"
              }
            />
            <button
              type="button"
              onClick={() => deleteRow(index)}
              className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
              title="Padam baris"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CSPDevelopmentCommitteeEditor({
  content,
  defaultCommitteeMembers,
  defaultFacilitators,
  onContentChange,
}: {
  content?: string;
  defaultCommitteeMembers?: CommitteeMember[];
  defaultFacilitators?: CommitteeMember[];
  onContentChange: (content: string) => void;
}) {
  const panelMembers = defaultCommitteeMembers || [];
  const facilitators = defaultFacilitators || [];
  const currentData = useMemo(() => parseDevelopmentCommittee(content), [content]);
  const hasAutoCommitteeData = panelMembers.length > 0 || facilitators.length > 0;
  const data = useMemo(
    () =>
      hasAutoCommitteeData
        ? buildDevelopmentCommitteeFromMembers(
            panelMembers,
            facilitators,
            currentData
          )
        : currentData,
    [currentData, facilitators, hasAutoCommitteeData, panelMembers]
  );

  useEffect(() => {
    if (!hasAutoCommitteeData) return;

    const nextContent = stringifyDevelopmentCommittee(data);
    if (nextContent !== content) {
      onContentChange(nextContent);
    }
  }, [content, data, hasAutoCommitteeData, onContentChange]);

  function updateGroup(
    group: keyof StandardDevelopmentCommittee,
    rows: CommitteeRow[]
  ) {
    onContentChange(
      stringifyDevelopmentCommittee({
        ...data,
        [group]: rows,
      })
    );
  }

  function updateRow(
    group: keyof StandardDevelopmentCommittee,
    index: number,
    key: keyof CommitteeRow,
    value: string
  ) {
    updateGroup(
      group,
      data[group].map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      )
    );
  }

  function addRow(group: keyof StandardDevelopmentCommittee) {
    updateGroup(group, [...data[group], { left: "", right: "" }]);
  }

  function deleteRow(group: keyof StandardDevelopmentCommittee, index: number) {
    updateGroup(
      group,
      data[group].filter((_, rowIndex) => rowIndex !== index)
    );
  }

  function renderGroup(
    group: keyof StandardDevelopmentCommittee,
    title: string
  ) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-slate-700">
            {title}
          </h3>
          <button
            type="button"
            onClick={() => addRow(group)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Plus size={14} />
            Tambah
          </button>
        </div>

        {data[group].map((row, index) => (
          <div
            key={`${group}-editor-${index}`}
            className="grid grid-cols-[1fr_1fr_auto] gap-3"
          >
            <input
              value={row.left}
              onChange={(event) =>
                updateRow(group, index, "left", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder="Nama / jawatan"
            />
            <input
              value={row.right}
              onChange={(event) =>
                updateRow(group, index, "right", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder="Organisasi / peranan"
            />
            <button
              type="button"
              onClick={() => deleteRow(group, index)}
              className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
              title="Padam baris"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-blue-700">
          7. Standard Development Committee
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Lengkapkan senarai ahli pembangunan standard, sekretariat dan
          fasilitator.
        </p>
      </div>

      <div className="space-y-8 p-6">
        {renderGroup("committee", "Committee Members")}
        {renderGroup("secretariat", "Secretariat")}
        {renderGroup("facilitator", "Facilitator")}
      </div>
    </div>
  );
}

function CSPBuilderSectionPanel({
  section,
  standardTitle,
  standardLevel,
  careerPath,
  sector,
  subsector,
  sectionContent,
  onContentChange,
}: {
  section: CSPBuilderSectionDetail;
  standardTitle: string;
  standardLevel: string;
  careerPath: string;
  sector: string;
  subsector: string;
  sectionContent?: string;
  onContentChange: (content: string) => void;
}) {
  const sectionNo =
    Object.entries(CSP_BUILDER_SECTION_DETAILS).find(
      ([, detail]) => detail === section
    )?.[0] || "1";
  const defaultDraft = getDefaultCSPSectionContent(
    sectionNo,
    section,
    standardTitle,
    standardLevel,
    careerPath
  );
  const content = sectionContent ?? defaultDraft;
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateAI() {
    try {
      setIsGenerating(true);

      const res = await fetch("/api/csp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionTitle: section.title,
          sectionDescription: section.description,
          standardTitle,
          standardLevel,
          careerPath,
          sector,
          subsector,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menjana kandungan CSP.");
      }

      const data = (await res.json()) as { content?: string };

      if (data.content) {
        onContentChange(data.content);
      }
    } catch (error) {
      console.error("Gagal jana AI CSP:", error);
      alert("Gagal menjana kandungan CSP.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-blue-700">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {section.description}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              section.kind === "manual"
                ? "bg-emerald-100 text-emerald-700"
                : section.kind === "fixed"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {section.kind === "manual"
              ? "Draf CSP"
              : section.kind === "fixed"
                ? "Teks Tetap"
                : "Auto"}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-6 py-6">
        {section.kind === "manual" ? (
          <>
            <textarea
              className="min-h-[220px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "Menjana..." : "Jana AI"}
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {section.description}
          </div>
        )}
      </div>
    </div>
  );
}

function CSPPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const [viewMode, setViewMode] = useState<"builder" | "document">("builder");
  const [activeBuilderSection, setActiveBuilderSection] = useState("1");
  const [targetInfo, setTargetInfo] = useState<COSTargetInfo | null>(null);
  const [matrix, setMatrix] = useState<COSMatrix | null>(null);
  const [clusters, setClusters] = useState<StoredCluster[]>([]);
  const [cspSections, setCspSections] = useState<Record<string, string>>({});
  const [isSavingCSP, setIsSavingCSP] = useState(false);
  const [isCSPSaved, setIsCSPSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(
    []
  );
  const [facilitatorMembers, setFacilitatorMembers] = useState<
    CommitteeMember[]
  >([]);
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
  const activeBuilderDetail =
    CSP_BUILDER_SECTION_DETAILS[activeBuilderSection] ??
    CSP_BUILDER_SECTION_DETAILS["1"];
  const careerPath = useMemo(
    () =>
      targetInfo?.subarea ||
      projectInfo.subarea ||
      projectInfo.area ||
      projectInfo.subsector ||
      "-",
    [projectInfo.area, projectInfo.subarea, projectInfo.subsector, targetInfo]
  );
  const cspDocumentContext = useMemo(
    () =>
      [
        projectInfo.code,
        projectInfo.sector,
        projectInfo.subsector,
        projectInfo.area,
        standardTitle,
        standardLevel,
        careerPath,
        ...Object.entries(cspSections)
          .filter(([key]) => key !== "abbreviation" && key !== "glossary")
          .map(([, value]) => value),
        ...competencies.flatMap((competency) => [
          competency.code,
          competency.title,
          ...competency.units.flatMap((unit) => [unit.code, unit.title]),
        ]),
      ]
        .filter(Boolean)
        .join("\n"),
    [
      projectInfo.code,
      projectInfo.sector,
      projectInfo.subsector,
      projectInfo.area,
      standardTitle,
      standardLevel,
      careerPath,
      cspSections,
      competencies,
    ]
  );
  const ccpHref = projectId ? `/ccp?projectId=${projectId}` : "/ccp";
  const cccHref = projectId ? `/ccc?projectId=${projectId}` : "/ccc";
  const technicalCommitteeRows = parseCommitteeRows(cspSections["6"], 4);
  const developmentCommittee = parseDevelopmentCommittee(cspSections["7"]);
  const cspMissingItems = getCSPMissingItems({
    isSaved: isCSPSaved,
    competenciesCount: competencies.length,
    technicalRows: technicalCommitteeRows,
    developmentCommittee,
  });
  const isCSPReadyForNext = cspMissingItems.length === 0;
  const cspMissingMessage = cspMissingItems.join("\n");

  function updateCSPSection(sectionNo: string, content: string) {
    setIsCSPSaved(false);
    setSaveMessage("");
    setCspSections((prev) => ({
      ...prev,
      [sectionNo]: content,
    }));
  }

  useEffect(() => {
    if (!projectId) return;

    async function loadCSPContent() {
      try {
        const token = getAuthToken();

        const res = await fetch(`${API_URL}/csp/content/${projectId}`, {
          cache: "no-store",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) return;

        const data = (await res.json()) as {
          sections?: Record<string, string>;
        };

        setCspSections(data.sections || {});
        setIsCSPSaved(Boolean(data.sections && Object.keys(data.sections).length > 0));
      } catch (error) {
        console.error("Gagal load kandungan CSP:", error);
      }
    }

    loadCSPContent();
  }, [projectId]);

  async function handleSaveCSPContent() {
    if (!projectId) {
      alert("Project ID tidak ditemui.");
      return;
    }

    try {
      setIsSavingCSP(true);
      setSaveMessage("");

      const token = getAuthToken();
      const nextSections = Object.fromEntries(
        Object.entries(CSP_BUILDER_SECTION_DETAILS).map(([sectionNo, detail]) => {
          const defaultContent = getDefaultCSPSectionContent(
            sectionNo,
            detail,
            standardTitle,
            standardLevel,
            careerPath
          );

          return [
            sectionNo,
            sectionNo === "3"
              ? defaultContent
              : cspSections[sectionNo]?.trim() || defaultContent,
          ];
        })
      );

      const res = await fetch(`${API_URL}/csp/content/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sections: nextSections,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan kandungan CSP.");
      }

      setCspSections(nextSections);
      setIsCSPSaved(true);
      setSaveMessage("Kandungan CSP telah disimpan.");
    } catch (error) {
      console.error("Gagal simpan kandungan CSP:", error);
      alert("Gagal menyimpan kandungan CSP.");
    } finally {
      setIsSavingCSP(false);
    }
  }

  useEffect(() => {
    if (!sessionName) {
      queueMicrotask(() => setClusters([]));
      return;
    }

    async function loadCCPCClusters() {
      try {
        const token = getAuthToken();
        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const selectionRes = await fetch(`${API_URL}/ccpc/selection/${sessionName}`, {
          cache: "no-store",
          headers,
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
          headers,
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

  useEffect(() => {
    if (!sessionName) {
      queueMicrotask(() => setCommitteeMembers([]));
      return;
    }

    async function loadCommitteeMembers() {
      const token = getAuthToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const cardsRes = await fetch(`${API_URL}/ccpc/cards/${sessionName}`, {
          cache: "no-store",
          headers,
        });

        if (!cardsRes.ok) {
          setCommitteeMembers([]);
          return;
        }

        const cards = (await cardsRes.json()) as PanelCard[];
        const panelMap = new Map<string, CommitteeMember>();

        cards.forEach((card) => {
          const name = cleanText(card.panel_name);

          if (!name || name.toLowerCase() === "panel") return;

          const key = name.toLowerCase();
          if (panelMap.has(key)) return;

          panelMap.set(key, {
            name,
            organization: cleanText(card.panel_organization) || "-",
            role: cleanText(card.panel_position) || "Panel Industri",
          });
        });

        setCommitteeMembers(Array.from(panelMap.values()));
      } catch (error) {
        console.error("Gagal load ahli panel CSP:", error);
        setCommitteeMembers([]);
      }
    }

    loadCommitteeMembers();
  }, [sessionName]);

  useEffect(() => {
    if (!projectId) {
      queueMicrotask(() => setFacilitatorMembers([]));
      return;
    }

    async function loadFacilitators() {
      const token = getAuthToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const [assignmentsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/project-assignments/project/${projectId}`, {
            cache: "no-store",
            headers,
          }),
          fetch(`${API_URL}/users/`, {
            cache: "no-store",
            headers,
          }),
        ]);

        if (!assignmentsRes.ok || !usersRes.ok) {
          setFacilitatorMembers([]);
          return;
        }

        const assignments = (await assignmentsRes.json()) as ProjectAssignment[];
        const users = (await usersRes.json()) as UserSummary[];
        const userMap = new Map(users.map((user) => [String(user.id), user]));

        const facilitators = assignments
          .filter(
            (assignment) =>
              assignment.assignment_role === "FACILITATOR" &&
              String(assignment.status || "ACTIVE").toUpperCase() === "ACTIVE"
          )
          .map((assignment) => {
            const user = userMap.get(String(assignment.user_id));

            if (!user?.name) return null;

            return {
              name: user.name,
              organization: user.organization || "-",
              role: "Facilitator",
            };
          })
          .filter((item): item is CommitteeMember => Boolean(item));

        setFacilitatorMembers(facilitators);
      } catch (error) {
        console.error("Gagal load fasilitator CSP:", error);
        setFacilitatorMembers([]);
      }
    }

    loadFacilitators();
  }, [projectId]);

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
          </div>
        </div>
      </div>

      {saveMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {saveMessage}
        </div>
      ) : null}

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
          committeeMembers={committeeMembers}
          cspSections={cspSections}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <CSPStructureSidebar
              activeSection={activeBuilderSection}
              onSelectSection={setActiveBuilderSection}
            />

            <div className="space-y-6">
              {activeBuilderSection === "abbreviation" ||
              activeBuilderSection === "glossary" ? (
                <CSPTermTableEditor
                  sectionNo={activeBuilderSection}
                  title={activeBuilderDetail.title}
                  description={activeBuilderDetail.description}
                  content={cspSections[activeBuilderSection]}
                  documentContext={cspDocumentContext}
                  onContentChange={(content) =>
                    updateCSPSection(activeBuilderSection, content)
                  }
                />
              ) : activeBuilderSection === "6" ? (
                <CSPCommitteeTableEditor
                  title="6. Standard Technical Evaluation Committee"
                  description="Lengkapkan nama dan organisasi/peranan jawatankuasa penilaian teknikal."
                  content={cspSections["6"]}
                  onContentChange={(content) =>
                    updateCSPSection("6", content)
                  }
                />
              ) : activeBuilderSection === "7" ? (
                <CSPDevelopmentCommitteeEditor
                  content={cspSections["7"]}
                  defaultCommitteeMembers={committeeMembers}
                  defaultFacilitators={facilitatorMembers}
                  onContentChange={(content) =>
                    updateCSPSection("7", content)
                  }
                />
              ) : (
                <CSPBuilderSectionPanel
                  key={activeBuilderSection}
                  section={activeBuilderDetail}
                  standardTitle={standardTitle}
                  standardLevel={standardLevel}
                  careerPath={careerPath}
                  sector={projectInfo.sector}
                  subsector={projectInfo.subsector}
                  sectionContent={cspSections[activeBuilderSection]}
                  onContentChange={(content) =>
                    updateCSPSection(activeBuilderSection, content)
                  }
                />
              )}

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
                  <button
                    type="button"
                    onClick={handleSaveCSPContent}
                    disabled={isSavingCSP}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {isSavingCSP ? "Menyimpan..." : "Save"}
                  </button>

                  {isCSPReadyForNext ? (
                    <Link
                      href={cccHref}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Seterusnya: CCC
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Sila lengkapkan perkara berikut:\n\n${cspMissingMessage}`
                        )
                      }
                      title={cspMissingMessage}
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-5 py-3 font-semibold text-white"
                    >
                      Seterusnya: CCC
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>

              {!isCSPReadyForNext ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  <div className="font-semibold">
                    Belum boleh teruskan ke CCC.
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {cspMissingItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
