import { NextRequest, NextResponse } from "next/server";

function normalizeSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function toLowerPhrase(text: string): string {
  return text.trim().replace(/[.!?]$/, "").toLowerCase();
}

function buildLearningOutcomes(cuTitle: string, workStepTitle: string, pcs: string[]) {
  const cu = toLowerPhrase(cuTitle);
  const ws = toLowerPhrase(workStepTitle);

  return [
    `Describe the purpose and requirements to ${cu} in accordance with workplace procedures.`,
    `Perform ${ws} according to the required method, safety requirement, and quality standard.`,
    `Demonstrate compliance with the related performance criteria during task execution.`,
  ];
}

function buildKnowledge(cuTitle: string, workStepTitle: string, pcs: string[]) {
  const cu = toLowerPhrase(cuTitle);
  const ws = toLowerPhrase(workStepTitle);

  const base = [
    `Introduction to ${cu}.`,
    `Tools, materials, equipment, and relevant operational requirements for ${cu}.`,
    `Applicable safety precautions, quality requirements, and work standards related to ${ws}.`,
  ];

  const pcBased = pcs.slice(0, 3).map(
    (pc) => `Knowledge related to ${toLowerPhrase(pc)}.`
  );

  return [...base, ...pcBased];
}

function buildAttitude(workStepTitle: string) {
  const ws = toLowerPhrase(workStepTitle);

  return [
    `Demonstrate responsibility in carrying out ${ws}.`,
    `Maintain work discipline and follow instructions during task execution.`,
  ];
}

function buildSafety(workStepTitle: string) {
  const ws = toLowerPhrase(workStepTitle);

  return [
    `Comply with all safety requirements and wear appropriate PPE during ${ws}.`,
    `Ensure tools, materials, and work area are handled safely at all times.`,
  ];
}

function buildEnvironment(workStepTitle: string) {
  const ws = toLowerPhrase(workStepTitle);

  return [
    `Maintain cleanliness of the work area throughout ${ws}.`,
    `Dispose of waste materials according to environmental requirements.`,
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      competencyTitle,
      cuTitle,
      workStepTitle,
      performanceCriteriaTexts = [],
    } = body;

    if (!cuTitle || !workStepTitle) {
      return NextResponse.json(
        { error: "cuTitle and workStepTitle are required" },
        { status: 400 }
      );
    }

    const learningOutcomes = buildLearningOutcomes(
      cuTitle,
      workStepTitle,
      performanceCriteriaTexts
    ).map(normalizeSentence);

    const knowledgeItems = buildKnowledge(
      cuTitle,
      workStepTitle,
      performanceCriteriaTexts
    ).map(normalizeSentence);

    const attitudeItems = buildAttitude(workStepTitle).map(normalizeSentence);
    const safetyItems = buildSafety(workStepTitle).map(normalizeSentence);
    const environmentItems = buildEnvironment(workStepTitle).map(normalizeSentence);

    return NextResponse.json({
      learningOutcomes,
      knowledgeItems,
      attitudeItems,
      safetyItems,
      environmentItems,
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