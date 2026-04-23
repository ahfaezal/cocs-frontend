import { CCPCompetency } from "./ccc-mapper";
import { CCCDocumentData, CCCDocumentUnit } from "./ccc-document-types";
import { CCCItem } from "./ccc-types";

export interface CCCDocumentMetaInput {
  section: string;
  group: string;
  area: string;
  cocsTitle: string;
  competencyTitle?: string;
  competencyCode?: string;
  cocsLevel?: string;
  trainingPrerequisite?: string;
}

function normalizeSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function toLowerPhrase(text: string): string {
  return text.trim().replace(/[.!?]$/, "").toLowerCase();
}

function buildLearningOutcomeIntro(
  competencyTitle: string,
  competencyUnits: string[]
): string {
  if (!competencyTitle && competencyUnits.length === 0) {
    return "The learning outcomes of this competency are to enable the trainees to perform the required tasks in accordance with established work procedures, safety requirements, and industry practices.";
  }

  const competencyPhrase = competencyTitle
    ? toLowerPhrase(competencyTitle)
    : "perform the required competency";

  return `The learning outcomes of this competency are to enable the trainees to ${competencyPhrase} in accordance with established work procedures, safety requirements, and industry practices.`;
}

function formatNumberedItems(unitNumber: number, items: string[]): string[] {
  return items
    .map((item, index) => `${unitNumber}.${index + 1} ${normalizeSentence(item)}`)
    .filter(Boolean);
}

function extractWorkSteps(workSteps: { title: string }[]): string[] {
  return workSteps.map((ws) => ws.title).filter(Boolean);
}

function getItemsByCU(cccItems: CCCItem[] | undefined, cuId: string) {
  return (cccItems || []).filter((item) => item.cuId === cuId);
}

function fallbackKnowledge(
  unitNumber: number,
  competencyUnitTitle: string,
  workSteps: string[]
): string[] {
  const baseItems = [
    `Introduction to ${toLowerPhrase(competencyUnitTitle)}.`,
    `Tools, materials, equipment, and relevant operational requirements for ${toLowerPhrase(
      competencyUnitTitle
    )}.`,
    `Applicable safety precautions, quality requirements, and work standards related to ${toLowerPhrase(
      competencyUnitTitle
    )}.`,
    ...workSteps.map(
      (step) => `Knowledge related to ${toLowerPhrase(step)}.`
    ),
  ];

  return formatNumberedItems(unitNumber, baseItems);
}

function fallbackASE(unitNumber: number) {
  return {
    attitudeItems: formatNumberedItems(unitNumber, [
      "Demonstrate responsibility in carrying out assigned work.",
      "Maintain work discipline and follow instructions during task execution.",
    ]),
    safetyItems: formatNumberedItems(unitNumber, [
      "Comply with all safety requirements and wear appropriate PPE.",
      "Ensure tools, materials, and work area are handled safely at all times.",
    ]),
    environmentItems: formatNumberedItems(unitNumber, [
      "Maintain cleanliness of the work area throughout the task.",
      "Dispose of waste materials according to environmental requirements.",
    ]),
  };
}

function mergeAISuggestedItems(
  unitNumber: number,
  items: CCCItem[],
  key:
    | "knowledgeItems"
    | "attitudeItems"
    | "safetyItems"
    | "environmentItems"
): string[] {
  const merged = items.flatMap((item) => item.aiSuggested?.[key] || []);
  if (merged.length === 0) return [];
  return formatNumberedItems(unitNumber, merged);
}

function mapCompetencyToDocumentUnits(
  competency: CCPCompetency,
  cccItems?: CCCItem[]
): CCCDocumentUnit[] {
  return competency.competencyUnit.map((cu, cuIndex) => {
    const unitNumber = cuIndex + 1;
    const rawWorkSteps = extractWorkSteps(cu.workSteps);
    const numberedWorkSteps = formatNumberedItems(unitNumber, rawWorkSteps);

    const relatedItems = getItemsByCU(cccItems, cu.id);

    const knowledgeItems =
      mergeAISuggestedItems(unitNumber, relatedItems, "knowledgeItems") ||
      [];

    const attitudeItems =
      mergeAISuggestedItems(unitNumber, relatedItems, "attitudeItems") || [];

    const safetyItems =
      mergeAISuggestedItems(unitNumber, relatedItems, "safetyItems") || [];

    const environmentItems =
      mergeAISuggestedItems(unitNumber, relatedItems, "environmentItems") || [];

    const fallback = fallbackASE(unitNumber);

    return {
      id: cu.id,
      competencyUnitNumber: unitNumber,
      competencyUnitTitle: normalizeSentence(cu.title),
      knowledgeItems:
        knowledgeItems.length > 0
          ? knowledgeItems
          : fallbackKnowledge(unitNumber, cu.title, rawWorkSteps),
      workSteps: numberedWorkSteps,
      attitudeItems:
        attitudeItems.length > 0 ? attitudeItems : fallback.attitudeItems,
      safetyItems:
        safetyItems.length > 0 ? safetyItems : fallback.safetyItems,
      environmentItems:
        environmentItems.length > 0
          ? environmentItems
          : fallback.environmentItems,
    };
  });
}

export function mapCCPToCCCDocument(
  ccpData: CCPCompetency[],
  meta: CCCDocumentMetaInput,
  cccItems?: CCCItem[]
): CCCDocumentData | null {
  if (!ccpData || ccpData.length === 0) return null;

  const competency = ccpData[0];

  const competencyUnits = competency.competencyUnit.map((cu) =>
    normalizeSentence(cu.title)
  );

  const units = mapCompetencyToDocumentUnits(competency, cccItems);

  return {
    header: {
      section: meta.section,
      group: meta.group,
      area: meta.area,
      cocsTitle: meta.cocsTitle,
      competencyTitle: meta.competencyTitle || competency.title,
      competencyCode: meta.competencyCode || "XXX-C01",
      cocsLevel: meta.cocsLevel || "Two (2)",
      trainingPrerequisite: meta.trainingPrerequisite || "Not available.",
    },
    learningOutcome: {
      intro: buildLearningOutcomeIntro(
        meta.competencyTitle || competency.title,
        competencyUnits
      ),
      fixedStatement:
        "Upon completion of this competency, trainees should be able to:",
      competencyUnitList: competencyUnits,
    },
    units,
  };
}