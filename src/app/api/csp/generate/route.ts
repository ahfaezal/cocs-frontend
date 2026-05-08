import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type CSPGenerateRequest = {
  sectionTitle?: string;
  sectionDescription?: string;
  standardTitle?: string;
  standardLevel?: string;
  careerPath?: string;
  sector?: string;
  subsector?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanText(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function buildFallback(body: CSPGenerateRequest) {
  const title = cleanText(body.sectionTitle) || "Selected CSP section";
  const standardTitle = cleanText(body.standardTitle) || "the occupation";
  const standardLevel = cleanText(body.standardLevel) || "-";
  const careerPath = cleanText(body.careerPath) || "the relevant career path";

  return {
    content: `${title} bagi ${standardTitle} Tahap ${standardLevel} dalam ${careerPath}.`,
    generatedAt: new Date().toISOString(),
  };
}

function buildPrompt(body: CSPGenerateRequest) {
  return `
You are an expert in Malaysia COCS/CSP document development.

Generate formal CSP content for the selected section only.

Rules:
- Write in Bahasa Melayu formal.
- Use one coherent paragraph unless the section clearly needs a short list.
- Do not include markdown.
- Do not include the section title.
- Do not invent committee names, addresses, laws or standards if not provided.
- Keep the text suitable for a Construction Occupational Competency Standard Practice document.
- Return ONLY valid JSON. No markdown.

Context:
SECTION TITLE: ${body.sectionTitle || "-"}
SECTION PURPOSE: ${body.sectionDescription || "-"}
COCS TITLE: ${body.standardTitle || "-"}
COCS LEVEL: ${body.standardLevel || "-"}
CAREER PATH / AREA: ${body.careerPath || "-"}
SECTOR: ${body.sector || "-"}
SUBSECTOR: ${body.subsector || "-"}

JSON format:
{
  "content": "..."
}
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CSPGenerateRequest;

    if (!body.sectionTitle?.trim()) {
      return NextResponse.json(
        { error: "sectionTitle is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildFallback(body));
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content:
            "Return only valid JSON for a formal COCS Standard Practice document.",
        },
        { role: "user", content: buildPrompt(body) },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const jsonText = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
    const parsed = JSON.parse(jsonText) as { content?: string };
    const content = cleanText(parsed.content);

    if (!content) {
      return NextResponse.json(buildFallback(body));
    }

    return NextResponse.json({
      content,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CSP generate API error:", error);

    return NextResponse.json(
      { error: "Failed to generate CSP content" },
      { status: 500 }
    );
  }
}
