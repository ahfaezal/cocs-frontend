import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type GenerationScope = "descriptor" | "unit";

type CCPGenerateRequest = {
  section?: string;
  group?: string;
  area?: string;
  cocsTitle?: string;
  cocsLevel?: string;
  competencyTitle?: string;
  competencyCode?: string;
  competencyUnit?: string;
  competencyUnitCode?: string;
  competencyUnits?: string[];
  generationScope?: GenerationScope;
  unitSequence?: number;
};

type CCPGenerateResult = {
  descriptor: string;
  workSteps: string[];
  performanceCriteria: string[];
  generatedAt?: string;
};

type DescriptorAIResult = {
  activityScope?: string;
  outcome?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sentenceCase(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean) return clean;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function cleanText(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function getScope(body: CCPGenerateRequest): GenerationScope {
  return body.generationScope === "descriptor" ? "descriptor" : "unit";
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function getCompetencyUnitList(body: CCPGenerateRequest) {
  const units =
    Array.isArray(body.competencyUnits) && body.competencyUnits.length > 0
      ? body.competencyUnits
      : body.competencyUnit
        ? [body.competencyUnit]
        : [];

  return units.map(cleanText).filter(Boolean);
}

function joinCompetencyUnits(units: string[]) {
  if (units.length === 0) return "perform the required competency units";
  if (units.length === 1) return units[0].toLowerCase();

  const lowerUnits = units.map((item) => item.toLowerCase());
  const last = lowerUnits[lowerUnits.length - 1];

  return `${lowerUnits.slice(0, -1).join(", ")} and ${last}`;
}

function ensureFullStop(value: string) {
  const clean = value.trim();
  if (!clean) return clean;
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function lowerFirst(value: string) {
  const clean = value.trim();
  if (!clean) return clean;
  return clean.charAt(0).toLowerCase() + clean.slice(1);
}

function buildDescriptor(
  body: CCPGenerateRequest,
  aiResult: DescriptorAIResult
) {
  const competencyTitle = sentenceCase(
    body.competencyTitle || "Selected competency"
  );

  const activityScope = ensureFullStop(
    lowerFirst(cleanText(aiResult.activityScope)) ||
      "perform the required occupational activities in a safe and systematic manner in accordance with approved procedures, technical specifications and safety requirements."
  );

  const competencyUnits = joinCompetencyUnits(getCompetencyUnitList(body));

  const outcome = ensureFullStop(
    lowerFirst(cleanText(aiResult.outcome)) ||
      "competency work is completed according to required quality, safety and operational standards."
  );

  return `${competencyTitle} describes the activities required to ${activityScope}

The person who is competent in this competency should be able to ${competencyUnits}.

The outcome of this competency is ${outcome}`;
}

function buildFallback(body: CCPGenerateRequest): CCPGenerateResult {
  const scope = getScope(body);
  const unit = sentenceCase(
    body.competencyUnit || "perform assigned work activity"
  );

  if (scope === "descriptor") {
    return {
      descriptor: buildDescriptor(body, {
        activityScope:
          "perform the required railway track maintenance activities in a safe and systematic manner, ensuring compliance with work instructions, technical specifications, inspection requirements and railway safety procedures.",
        outcome:
          "railway track maintenance work is completed safely, systematically and in compliance with operational, quality and safety requirements.",
      }),
      workSteps: [],
      performanceCriteria: [],
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    descriptor: "",
    workSteps: [
      `Interpret work instruction for ${unit.toLowerCase()}`,
      `Prepare tools, equipment and materials for ${unit.toLowerCase()}`,
      `Apply safety control measures before performing ${unit.toLowerCase()}`,
      `Carry out ${unit.toLowerCase()} according to approved procedure`,
      `Inspect completed work against specified requirement`,
      `Record ${unit.toLowerCase()} result in maintenance documentation`,
    ],
    performanceCriteria: [
      "Work instruction was interpreted according to approved maintenance document and task requirement.",
      "Tools, equipment and materials were prepared based on the work activity requirement.",
      "Safety control measures were applied in accordance with railway safety procedure.",
      "Work activity was carried out according to approved procedure and quality requirement.",
      "Completed work was inspected based on specified acceptance criteria.",
      "Work result was recorded in accordance with maintenance documentation requirement.",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function parseUnitResult(text: string): CCPGenerateResult | null {
  try {
    const parsed = JSON.parse(text) as Partial<CCPGenerateResult>;

    const workSteps = Array.isArray(parsed.workSteps)
      ? parsed.workSteps.map(cleanText).filter(Boolean)
      : [];

    const performanceCriteria = Array.isArray(parsed.performanceCriteria)
      ? parsed.performanceCriteria.map(cleanText).filter(Boolean)
      : [];

    if (workSteps.length >= 5 && performanceCriteria.length >= workSteps.length) {
      return {
        descriptor: "",
        workSteps,
        performanceCriteria: performanceCriteria.slice(0, workSteps.length),
        generatedAt: new Date().toISOString(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function parseDescriptorResult(
  text: string,
  body: CCPGenerateRequest
): CCPGenerateResult | null {
  try {
    const parsed = JSON.parse(text) as DescriptorAIResult;

    return {
      descriptor: buildDescriptor(body, parsed),
      workSteps: [],
      performanceCriteria: [],
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function buildDescriptorPrompt(body: CCPGenerateRequest) {
  return `
You are an expert in Malaysia NOSS/COCS development, DACUM, and Competency Profile (CCP) writing.

Generate ONLY the variable parts of the Competency Descriptor.

IMPORTANT:
- Do not rewrite the fixed descriptor template.
- Do not include the competency title.
- Do not include "describes the activities required to".
- Do not include "The person who is competent in this competency should be able to".
- Do not include "The outcome of this competency is".
- Generate only:
  1. activityScope
  2. outcome
- activityScope must describe the activity scope for the competency.
- outcome must describe the final expected outcome of the competency.
- Keep language formal, clear and suitable for COCS/NOSS.
- Return ONLY valid JSON. No markdown.

Context:
SECTION: ${body.section || "-"}
GROUP: ${body.group || "-"}
AREA: ${body.area || "-"}
COCS TITLE: ${body.cocsTitle || "-"}
COCS LEVEL: ${body.cocsLevel || "-"}
COMPETENCY TITLE: ${body.competencyTitle || "-"}
COMPETENCY CODE: ${body.competencyCode || "-"}
COMPETENCY UNITS: ${getCompetencyUnitList(body).join("; ") || "-"}

JSON format:
{
  "activityScope": "...",
  "outcome": "..."
}
`;
}

function buildUnitPrompt(body: CCPGenerateRequest) {
  return `
You are an expert in Malaysia NOSS/COCS development, DACUM, and Competency Profile (CCP) writing.

Generate ONLY Work Steps and Performance Criteria for the selected Competency Unit.

Rules for WORK STEP:
- Work Step must be short and direct.
- Work Step must describe only the action to be performed.
- Do not include long purpose statements in Work Step.
- Do not include detailed standards, compliance statements, or acceptance criteria in Work Step.
- Generate not less than 5 Work Steps.
- Each Work Step must begin with an action verb.
- Every Work Step must start with numbering using this format: ${body.unitSequence || 1}.1, ${body.unitSequence || 1}.2, ${body.unitSequence || 1}.3 and so on.
- Good examples:
  "${body.unitSequence || 1}.1 Inspect the track alignment visually."
  "${body.unitSequence || 1}.2 Measure the track gauge using appropriate measuring tools."
  "${body.unitSequence || 1}.3 Document any discrepancies found during the inspection."
  "${body.unitSequence || 1}.4 Report the findings to the supervisor."
  "${body.unitSequence || 1}.5 Conduct follow-up inspections after maintenance work."

Rules for PERFORMANCE CRITERIA:
- Generate exactly one Performance Criteria for each Work Step.
- Performance Criteria must be written in past tense or passive assessment style.
- Performance Criteria must expand the matching Work Step with measurable quality, compliance, safety or documentation requirements.
- Performance Criteria may be longer than Work Step.
- Performance Criteria must not simply repeat the Work Step.
- Each Performance Criteria must include a reference phrase such as:
  "according to", "based on", "in accordance with", "following", "as specified in", or "in compliance with".
- Every Performance Criteria must start with numbering using this format: ${body.unitSequence || 1}.1, ${body.unitSequence || 1}.2, ${body.unitSequence || 1}.3 and so on.
- The numbering of Performance Criteria must match the Work Step numbering.
- Good examples:
  "${body.unitSequence || 1}.1 The track alignment was inspected to identify any deviations from the approved gauge tolerance according to the approved gauge tolerance."
  "${body.unitSequence || 1}.2 The track gauge was measured to ensure compliance with specifications."
  "${body.unitSequence || 1}.3 Discrepancies were documented in accordance with the maintenance log requirements."
  "${body.unitSequence || 1}.4 Findings were reported to the supervisor for further assessment and necessary action."
  "${body.unitSequence || 1}.5 Follow-up inspections were conducted to verify that the track alignment meets the approved gauge tolerance in compliance with the maintenance standards."

Other rules:
- Do not generate Competency Descriptor.
- Keep language in English because the source COCS format is English.
- Return ONLY valid JSON. No markdown.

Context:
SECTION: ${body.section || "-"}
GROUP: ${body.group || "-"}
AREA: ${body.area || "-"}
COCS TITLE: ${body.cocsTitle || "-"}
COCS LEVEL: ${body.cocsLevel || "-"}
COMPETENCY TITLE: ${body.competencyTitle || "-"}
COMPETENCY CODE: ${body.competencyCode || "-"}
COMPETENCY UNIT: ${body.competencyUnit || "-"}
COMPETENCY UNIT CODE: ${body.competencyUnitCode || "-"}

JSON format:
{
  "descriptor": "",
  "workSteps": ["...", "..."],
  "performanceCriteria": ["...", "..."]
}
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CCPGenerateRequest;
    const scope = getScope(body);

    if (scope === "descriptor" && !body.competencyTitle?.trim()) {
      return NextResponse.json(
        { error: "competencyTitle is required" },
        { status: 400 }
      );
    }

    if (scope === "unit" && !body.competencyUnit?.trim()) {
      return NextResponse.json(
        { error: "competencyUnit is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildFallback(body));
    }

    const prompt =
      scope === "descriptor"
        ? buildDescriptorPrompt(body)
        : buildUnitPrompt(body);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content:
            "Return only valid JSON for a formal Competency Profile (CCP).",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const extracted = extractJsonObject(raw) || raw;

    const parsed =
      scope === "descriptor"
        ? parseDescriptorResult(extracted, body)
        : parseUnitResult(extracted);

    return NextResponse.json(parsed || buildFallback(body));
  } catch (error) {
    console.error("CCP generate API error:", error);

    return NextResponse.json(
      { error: "Failed to generate CCP content" },
      { status: 500 }
    );
  }
}
