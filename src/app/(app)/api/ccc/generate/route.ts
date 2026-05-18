import { NextRequest, NextResponse } from "next/server";

function normalizeSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function toLowerPhrase(text: string): string {
  return text.trim().replace(/[.!?]$/, "").toLowerCase();
}

function stripNumberPrefix(text: string): string {
  return text.trim().replace(/^\d+(?:\.\d+)*\.?\s*/, "").trim();
}

function normalizeWorkSteps(workStepTitle: string, workSteps: unknown) {
  const rawItems = Array.isArray(workSteps)
    ? workSteps
    : String(workStepTitle || "")
        .split(/;|\r?\n/)
        .map((item) => item.trim());

  return rawItems
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .map((item, index) => {
      const match = item.match(/^(\d+(?:\.\d+)*\.?)\s*(.*)$/);
      const number = match?.[1]?.replace(/\.$/, "") || `1.${index + 1}`;
      const text = match?.[2] || item;

      return {
        number,
        text: stripNumberPrefix(text),
      };
    });
}

function normalizeCompetencyUnits(items: unknown) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function formatNumbered(number: string, text: string) {
  return `${number} ${normalizeSentence(text)}`;
}

function buildLearningOutcomes(
  competencyTitle: string,
  cuTitle: string,
  competencyUnits: string[]
) {
  const units = competencyUnits.length > 0 ? competencyUnits : [cuTitle];
  const scope = units.map((unit) => toLowerPhrase(unit)).join(", ");

  return [
    `The learning outcomes of this competency are to enable the trainees to perform ${toLowerPhrase(
      competencyTitle || cuTitle
    )} by applying ${scope} in accordance with established industry guidelines, work procedures, and safety requirements.`,
    "",
    "Upon completion of this competency, trainees should be able to:",
    ...units.map((unit, index) => `${index + 1}. ${normalizeSentence(unit)}`),
  ];
}

function buildKnowledge(
  cuTitle: string,
  workSteps: Array<{ number: string; text: string }>
) {
  const cu = toLowerPhrase(cuTitle);

  return workSteps.map((step) =>
    formatNumbered(
      step.number,
      `Information, tools, materials, equipment, operational requirements, and work standards required to ${toLowerPhrase(
        step.text
      )} for ${cu}`
    )
  );
}

function buildAttitude(workSteps: Array<{ number: string; text: string }>) {
  return workSteps.slice(0, 3).map((step) =>
    formatNumbered(
      step.number,
      `Demonstrate discipline, cooperation, punctuality, integrity, tolerance, and responsibility when carrying out ${toLowerPhrase(
        step.text
      )}`
    )
  );
}

function buildSafety(workSteps: Array<{ number: string; text: string }>) {
  return workSteps.slice(0, 3).map((step) =>
    formatNumbered(
      step.number,
      `Apply appropriate safety precautions, PPE, equipment inspection, warning signage, and hazard control when performing ${toLowerPhrase(
        step.text
      )}`
    )
  );
}

function buildEnvironment(workSteps: Array<{ number: string; text: string }>) {
  return workSteps.slice(0, 3).map((step) =>
    formatNumbered(
      step.number,
      `Protect the work environment by maintaining cleanliness, applying 3R practices, preventing pollution, and managing waste properly while carrying out ${toLowerPhrase(
        step.text
      )}`
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      competencyTitle = "",
      cuTitle,
      workStepTitle = "",
      workSteps,
      competencyUnits = [],
    } = body;

    const normalizedWorkSteps = normalizeWorkSteps(workStepTitle, workSteps);
    const normalizedCompetencyUnits = normalizeCompetencyUnits(competencyUnits);

    if (!cuTitle || normalizedWorkSteps.length === 0) {
      return NextResponse.json(
        { error: "cuTitle and at least one work step are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      learningOutcomes: buildLearningOutcomes(
        competencyTitle,
        cuTitle,
        normalizedCompetencyUnits
      ),
      knowledgeItems: buildKnowledge(cuTitle, normalizedWorkSteps),
      attitudeItems: buildAttitude(normalizedWorkSteps),
      safetyItems: buildSafety(normalizedWorkSteps),
      environmentItems: buildEnvironment(normalizedWorkSteps),
      assessmentMethods: ["Observation", "Practical Test"],
      trainingHours: 1,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate CCC AI content" },
      { status: 500 }
    );
  }
}
