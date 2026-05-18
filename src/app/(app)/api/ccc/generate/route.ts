import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type WorkStep = {
  number: string;
  text: string;
};

type GenerateBody = {
  competencyTitle?: string;
  cuTitle?: string;
  workStepTitle?: string;
  workSteps?: unknown;
  competencyUnits?: unknown;
  performanceCriteriaTexts?: unknown;
  unitDetails?: unknown;
  mode?: "unit" | "learningOutcomes";
};

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

function normalizeTextList(items: unknown) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function formatNumbered(number: string, text: string) {
  return `${number} ${normalizeSentence(text)}`;
}

function getUnitPrefix(workSteps: WorkStep[]) {
  const firstNumber = workSteps[0]?.number || "1.1";
  return firstNumber.split(".")[0] || "1";
}

function renumberWithPrefix(items: string[], prefix: string) {
  return items
    .map((item) => stripNumberPrefix(item))
    .filter(Boolean)
    .map((item, index) => formatNumbered(`${prefix}.${index + 1}`, item));
}

function renumberWithWorkSteps(items: string[], workSteps: WorkStep[]) {
  return items
    .map((item, index) => {
      const text = stripNumberPrefix(item);
      const number = workSteps[index]?.number || `${getUnitPrefix(workSteps)}.${index + 1}`;

      return text ? formatNumbered(number, text) : "";
    })
    .filter(Boolean);
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
  workSteps: WorkStep[],
  performanceCriteria: string[]
) {
  const cu = toLowerPhrase(cuTitle);

  return workSteps.map((step, index) => {
    const pc = performanceCriteria[index]
      ? ` Performance criteria reference: ${stripNumberPrefix(performanceCriteria[index])}`
      : "";

    return formatNumbered(
      step.number,
      `Knowledge of work procedures, tools, equipment, materials, quality requirements, documentation, and applicable standards required to ${toLowerPhrase(
        step.text
      )} for ${cu}.${pc}`
    );
  });
}

function buildAttitude(cuTitle: string, workSteps: WorkStep[]) {
  const cu = toLowerPhrase(cuTitle);
  const stepScope = workSteps.map((step) => toLowerPhrase(step.text)).join(", ");
  const prefix = getUnitPrefix(workSteps);

  return [
    formatNumbered(
      `${prefix}.1`,
      `Demonstrate discipline, integrity, punctuality, cooperation, tolerance, and careful judgement while performing ${cu}`
    ),
    formatNumbered(
      `${prefix}.2`,
      `Communicate clearly, follow work instructions, practise 5S, and maintain professional conduct during ${stepScope}`
    ),
  ];
}

function buildSafety(cuTitle: string, workSteps: WorkStep[]) {
  const cu = toLowerPhrase(cuTitle);
  const prefix = getUnitPrefix(workSteps);
  const criticalSteps = workSteps
    .slice(0, 3)
    .map((step) => toLowerPhrase(step.text))
    .join(", ");

  return [
    formatNumbered(
      `${prefix}.1`,
      `Wear suitable PPE, verify tools and equipment are serviceable, and secure the work area before performing ${cu}`
    ),
    formatNumbered(
      `${prefix}.2`,
      `Control hazards related to ${criticalSteps}, including unsafe movement, incorrect tools, electrical exposure, poor signage, and other operational risks`
    ),
  ];
}

function buildEnvironment(cuTitle: string, workSteps: WorkStep[]) {
  const cu = toLowerPhrase(cuTitle);
  const prefix = getUnitPrefix(workSteps);

  return [
    formatNumbered(
      `${prefix}.1`,
      `Maintain cleanliness, apply 3R practices, and segregate waste materials properly while carrying out ${cu}`
    ),
    formatNumbered(
      `${prefix}.2`,
      `Prevent environmental pollution, avoid open burning, and dispose of used materials according to environmental and workplace requirements`
    ),
  ];
}

function coerceStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value.map((item) => String(item ?? "").trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : fallback;
}

async function generateWithOpenAI(
  body: GenerateBody,
  workSteps: WorkStep[],
  competencyUnits: string[],
  performanceCriteria: string[]
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const unitFallback = String(body.cuTitle || body.competencyTitle || "").trim();

  const prompt = `
Generate Construction Occupational Competency Standard (COCS) CCC content.
Return valid JSON only.

Context:
- Competency title: ${body.competencyTitle || ""}
- Competency unit title: ${body.cuTitle || ""}
- Generation mode: ${body.mode || "unit"}
- Competency Units under this Core Competency:
${JSON.stringify(competencyUnits.length ? competencyUnits : [unitFallback], null, 2)}
- Competency Unit details from CCP:
${JSON.stringify(body.unitDetails || [], null, 2)}
- Work Steps for this Competency Unit:
${JSON.stringify(workSteps, null, 2)}
- Performance Criteria from CCP:
${JSON.stringify(performanceCriteria, null, 2)}

Rules:
1. learningOutcomes must start exactly with:
"The learning outcomes of this competency are to enable the trainees to"
2. learningOutcomes must include:
"Upon completion of this competency, trainees should be able to:"
followed by numbered items taken from the Competency Units list, not the Work Steps.
3. Knowledge must be one-to-one with Work Steps. If Work Steps are 1.1 to 1.6, Knowledge must also be 1.1 to 1.6.
4. Knowledge describes information required to perform each Work Step, including procedures, tools, materials, equipment, standards, quality requirements, and relevant Performance Criteria.
5. Attitude describes work behaviour: discipline, integrity, cooperation, optimism, punctuality, tolerance, good judgement, 5S, and ethical conduct.
6. Safety describes measurable precautions to protect people, operations, tools, equipment, and the work area from hazards, accidents, injury, or unsafe practices.
7. Environment describes precautions to protect the environment, including waste handling, 3R, cleanliness, pollution prevention, and safe disposal.
8. Attitude, Safety, and Environment numbering must follow the same unit prefix as the Work Steps. If Work Steps are 2.1 to 2.5, all Attitude, Safety, and Environment items must start with 2.1, 2.2, and so on. Do not restart at 1.1 unless the Work Steps start at 1.x.
9. Avoid generic template wording. Tailor all items to the Competency Unit, Work Steps, and Performance Criteria.
10. Use concise professional English.

Return this JSON shape:
{
  "learningOutcomes": ["paragraph", "", "Upon completion...", "1. ..."],
  "knowledgeItems": ["same work step number ..."],
  "attitudeItems": ["same unit prefix ..."],
  "safetyItems": ["same unit prefix ..."],
  "environmentItems": ["same unit prefix ..."],
  "trainingHours": 1,
  "assessmentMethods": ["Observation", "Practical Test"]
}
`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert COCS/NOSS curriculum developer. Return valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.25,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  const knowledgeItems = coerceStringArray(
    parsed.knowledgeItems,
    buildKnowledge(body.cuTitle || "", workSteps, performanceCriteria)
  );
  const attitudeItems = coerceStringArray(
    parsed.attitudeItems,
    buildAttitude(body.cuTitle || "", workSteps)
  );
  const safetyItems = coerceStringArray(
    parsed.safetyItems,
    buildSafety(body.cuTitle || "", workSteps)
  );
  const environmentItems = coerceStringArray(
    parsed.environmentItems,
    buildEnvironment(body.cuTitle || "", workSteps)
  );
  const unitPrefix = getUnitPrefix(workSteps);

  return {
    learningOutcomes: coerceStringArray(
      parsed.learningOutcomes,
      buildLearningOutcomes(
        body.competencyTitle || "",
        body.cuTitle || "",
        competencyUnits
      )
    ),
    knowledgeItems: renumberWithWorkSteps(knowledgeItems, workSteps),
    attitudeItems: renumberWithPrefix(attitudeItems, unitPrefix),
    safetyItems: renumberWithPrefix(safetyItems, unitPrefix),
    environmentItems: renumberWithPrefix(environmentItems, unitPrefix),
    assessmentMethods: coerceStringArray(parsed.assessmentMethods, [
      "Observation",
      "Practical Test",
    ]),
    trainingHours: Number(parsed.trainingHours) || 1,
    source: "openai",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;

    const {
      competencyTitle = "",
      cuTitle,
      workStepTitle = "",
      workSteps,
      competencyUnits = [],
      performanceCriteriaTexts = [],
      mode = "unit",
    } = body;

    const normalizedWorkSteps = normalizeWorkSteps(workStepTitle, workSteps);
    const normalizedCompetencyUnits = normalizeCompetencyUnits(competencyUnits);
    const normalizedPerformanceCriteria = normalizeTextList(
      performanceCriteriaTexts
    );

    if (
      mode !== "learningOutcomes" &&
      (!cuTitle || normalizedWorkSteps.length === 0)
    ) {
      return NextResponse.json(
        { error: "cuTitle and at least one work step are required" },
        { status: 400 }
      );
    }

    let aiResult = null;

    try {
      aiResult = await generateWithOpenAI(
        body,
        normalizedWorkSteps,
        normalizedCompetencyUnits,
        normalizedPerformanceCriteria
      );
    } catch (error) {
      console.error("CCC OpenAI generation failed, using fallback:", error);
    }

    if (aiResult) {
      return NextResponse.json(aiResult);
    }

    return NextResponse.json({
      learningOutcomes: buildLearningOutcomes(
        competencyTitle,
        cuTitle || "",
        normalizedCompetencyUnits
      ),
      knowledgeItems: buildKnowledge(
        cuTitle || "",
        normalizedWorkSteps,
        normalizedPerformanceCriteria
      ),
      attitudeItems: buildAttitude(cuTitle || "", normalizedWorkSteps),
      safetyItems: buildSafety(cuTitle || "", normalizedWorkSteps),
      environmentItems: buildEnvironment(cuTitle || "", normalizedWorkSteps),
      assessmentMethods: ["Observation", "Practical Test"],
      trainingHours: 1,
      source: "fallback",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate CCC AI content" },
      { status: 500 }
    );
  }
}
