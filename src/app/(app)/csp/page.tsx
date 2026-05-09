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
  if (sectionNo === "prakata") {
    return [
      "Dokumen Standard Practice ini dibangunkan sebagai panduan kepada pihak berkepentingan dalam melaksanakan dan menilai kompetensi pekerjaan pembinaan berdasarkan Construction Occupational Competency Standard (COCS).",
      "Dokumen ini hendaklah digunakan bersama maklumat COS, CCPC dan CCP yang telah dibangunkan bagi memastikan kandungan standard adalah selaras dengan keperluan industri.",
    ].join("\n\n");
  }

  if (sectionNo === "abbreviation") {
    return [
      "CIDB - Construction Industry Development Board",
      "COCS - Construction Occupational Competency Standard",
      "COS - Construction Occupational Structure",
      "CCPC - Construction Competency Profile Chart",
      "CCP - Construction Competency Profile",
      "CSP - Construction Standard Practice",
    ].join("\n");
  }

  if (sectionNo === "glossary") {
    return [
      "Competency - Keupayaan untuk melaksanakan kerja mengikut standard yang ditetapkan.",
      "Occupational Structure - Struktur pekerjaan yang menunjukkan laluan kerjaya dan tahap kompetensi.",
      "Standard Practice - Amalan standard yang menjadi rujukan pelaksanaan kerja.",
    ].join("\n");
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
      "Level 1: Competent in performing a limited range of routine and predictable work activities under supervision.",
      "Level 2: Competent in performing a range of varied work activities in a variety of contexts, with some individual responsibility.",
      "Level 3: Competent in performing a broad range of work activities, with responsibility for own work and some responsibility for others.",
      "Level 4: Competent in performing complex technical or supervisory work activities with responsibility for work outcomes.",
      "Level 5: Competent in managing work processes, resources and teams within a defined operational area.",
      "Level 6: Competent in providing strategic, managerial and expert-level direction for occupational practice.",
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

function formatCommitteeRole(role: string) {
  const labels: Record<string, string> = {
    PROJECT_MANAGER: "Project Manager",
    FACILITATOR: "Facilitator",
    ASSESSOR: "Assessor",
    SUPER_ADMIN: "Super Admin",
  };

  return labels[role] || role.replace(/_/g, " ");
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

    const content =
      cspSections[sectionNo]?.trim() ||
      getDefaultCSPSectionContent(
        sectionNo,
        detail,
        standardTitle,
        standardLevel,
        careerPath
      );

    return (
      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">{detail.title}</h2>
        <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-900">
          {content}
        </div>
      </section>
    );
  };

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

      {renderSavedSection("6")}

      <section className="border border-slate-300 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          7. Standard Development Committee
        </h2>

        <div className="mt-4 text-center text-sm font-bold uppercase text-slate-900">
          {standardTitle}
        </div>
        <div className="mt-1 text-center text-sm font-bold uppercase text-slate-900">
          {formatLevel(standardLevel)}
        </div>

        {committeeMembers.length > 0 ? (
          <table className="mt-4 w-full border border-black text-sm text-black">
            <thead>
              <tr className="bg-slate-200">
                <th className="w-16 border border-black px-3 py-2 text-center">
                  No.
                </th>
                <th className="border border-black px-3 py-2 text-left">
                  Name
                </th>
                <th className="border border-black px-3 py-2 text-left">
                  Organisation
                </th>
                <th className="w-40 border border-black px-3 py-2 text-left">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {committeeMembers.map((member, memberIndex) => (
                <tr key={`csp-committee-${member.name}-${memberIndex}`}>
                  <td className="border border-black px-3 py-2 text-center">
                    {memberIndex + 1}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {member.name}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {member.organization}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {member.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Senarai ahli panel belum tersedia. Tetapkan pengguna kepada projek
            ini melalui modul Pengguna.
          </div>
        )}
      </section>
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
  const [saveMessage, setSaveMessage] = useState("");
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(
    []
  );
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
  const ccpHref = projectId ? `/ccp?projectId=${projectId}` : "/ccp";
  const cccHref = projectId ? `/ccc?projectId=${projectId}` : "/ccc";

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
        Object.entries(CSP_BUILDER_SECTION_DETAILS).map(
          ([sectionNo, detail]) => [
            sectionNo,
            cspSections[sectionNo]?.trim() ||
              getDefaultCSPSectionContent(
                sectionNo,
                detail,
                standardTitle,
                standardLevel,
                careerPath
              ),
          ]
        )
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

  useEffect(() => {
    if (!projectId) {
      queueMicrotask(() => setCommitteeMembers([]));
      return;
    }

    async function loadCommitteeMembers() {
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
          setCommitteeMembers([]);
          return;
        }

        const assignments = (await assignmentsRes.json()) as ProjectAssignment[];
        const users = (await usersRes.json()) as UserSummary[];

        const activeAssignments = assignments.filter(
          (assignment) => assignment.status !== "INACTIVE"
        );

        setCommitteeMembers(
          activeAssignments
            .map((assignment) => {
              const user = users.find((item) => item.id === assignment.user_id);
              if (!user || user.status === "INACTIVE") return null;

              return {
                name: user.name,
                organization: user.organization || "-",
                role: formatCommitteeRole(assignment.assignment_role),
              };
            })
            .filter((member): member is CommitteeMember => Boolean(member))
        );
      } catch (error) {
        console.error("Gagal load ahli panel CSP:", error);
        setCommitteeMembers([]);
      }
    }

    loadCommitteeMembers();
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

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <FileText size={16} />
              Salin dari Templat
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">
              <Eye size={16} />
              Pratonton
            </button>

            <button
              type="button"
              onClick={handleSaveCSPContent}
              disabled={isSavingCSP}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isSavingCSP ? "Menyimpan..." : "Simpan"}
            </button>
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
                  setCspSections((prev) => ({
                    ...prev,
                    [activeBuilderSection]: content,
                  }))
                }
              />

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
                    {isSavingCSP ? "Menyimpan..." : "Simpan Draf"}
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
