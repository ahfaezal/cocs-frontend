import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AICluster, AIClusterResult, DACUMCard } from "@/lib/ccpc-ai-types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OpenAIClusterDraft = {
  clusterName?: string;
  suggestedCategory?: "Core Candidate" | "Elective Candidate" | "Review Required";
  notes?: string;
  items?: string[];
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function dedupeCards(cards: DACUMCard[]): DACUMCard[] {
  const seen = new Set<string>();

  return cards.filter((card) => {
    const normalized = normalizeText(card.text || "");
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function getSuggestedCategory(
  name: string
): AICluster["suggestedCategory"] {
  const text = name.toLowerCase();

  if (
    text.includes("operasi") ||
    text.includes("pentadbiran") ||
    text.includes("kewangan") ||
    text.includes("keselamatan") ||
    text.includes("pengurusan")
  ) {
    return "Core Candidate";
  }

  if (
    text.includes("program") ||
    text.includes("dakwah") ||
    text.includes("komuniti") ||
    text.includes("sukarelawan")
  ) {
    return "Elective Candidate";
  }

  return "Review Required";
}

function buildConfidence(clusterSize: number): number {
  if (clusterSize >= 6) return 92;
  if (clusterSize >= 4) return 88;
  if (clusterSize >= 3) return 84;
  if (clusterSize >= 2) return 80;
  return 72;
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractJsonArray(text: string): string | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function buildFallbackResult(cards: DACUMCard[]): AIClusterResult {
  return {
    totalCards: cards.length,
    uniqueCards: cards.length,
    suggestedClusterCount: 0,
    status: "ready",
    clusters: [],
    unmatchedCards: cards,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incomingCards = (body.cards || []) as DACUMCard[];

    if (!Array.isArray(incomingCards) || incomingCards.length === 0) {
      return NextResponse.json(
        { error: "cards is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    const uniqueCards = dedupeCards(
      incomingCards.filter((card) => card?.text?.trim())
    );

    console.log("API CLUSTER HIT");
    console.log("OPENAI KEY:", process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING");
    console.log("TOTAL CARDS:", incomingCards.length);
    console.log("UNIQUE CARDS:", uniqueCards.length);

    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY missing. Returning fallback result.");
      return NextResponse.json(buildFallbackResult(uniqueCards));
    }

    const numberedList = uniqueCards
      .map((card, index) => `${index + 1}. ${card.text}`)
      .join("\n");

const prompt = `
You are an expert in Occupational Analysis, DACUM, and NOSS (Malaysia competency standards).

Your task:

1. First, determine the primary orientation of the occupation based on the given DACUM cards:
   - Product-based (producing tangible outputs)
   - Service-based (providing specific services)
   - Quality/Support service (supporting operations, coordination, administration)

2. Then cluster the DACUM tasks based on the MAIN WORK OUTPUT (not just wording similarity).

3. Clustering rules:
   - Product-based → group by product type
   - Service-based → group by type of service provided
   - Quality/Support → group by functional responsibility

4. Do NOT group based on superficial similarity of words.
5. Only group tasks that are functionally related.
6. Leave unrelated or unclear items as unmatched.

7. Generate:
   - professional cluster name (Bahasa Melayu)
   - category:
     - "Core Candidate"
     - "Elective Candidate"
     - "Review Required"

Return ONLY JSON array. No explanation. No markdown.

Format:
[
  {
    "clusterName": "Pengurusan Operasi Harian Masjid",
    "suggestedCategory": "Core Candidate",
    "notes": "Cluster ini menghimpunkan tugasan operasi harian masjid.",
    "items": [
      "Pantau perjalanan program masjid",
      "Sedia jadual tugas bilal"
    ]
  }
]

Senarai tugas DACUM:
${numberedList}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Anda pakar analisis kompetensi, DACUM, NOSS, TVET Malaysia, dan mesti memulangkan JSON yang sah sahaja.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || "";
    const extracted = extractJsonArray(rawText);
    const parsed = extracted
      ? safeJsonParse<OpenAIClusterDraft[]>(extracted)
      : safeJsonParse<OpenAIClusterDraft[]>(rawText);

    console.log("OPENAI RESPONSE RECEIVED:", !!rawText);
    console.log("OPENAI JSON PARSED:", Array.isArray(parsed));

    if (!parsed || !Array.isArray(parsed)) {
      console.warn("OpenAI output invalid JSON. Returning fallback result.");
      return NextResponse.json(buildFallbackResult(uniqueCards));
    }

    const usedCardIds = new Set<string>();

    const clusters: AICluster[] = parsed.reduce<AICluster[]>(
      (acc, cluster, index) => {
        const clusterItems = Array.isArray(cluster.items) ? cluster.items : [];

        const matchedCards = uniqueCards.filter((card) =>
          clusterItems.some(
            (itemText) => normalizeText(itemText) === normalizeText(card.text)
          )
        );

        if (matchedCards.length === 0) {
          return acc;
        }

        matchedCards.forEach((card) => usedCardIds.add(card.id));

        const suggestedName =
          cluster.clusterName?.trim() || `Cluster ${index + 1}`;

        const suggestedCategory =
          cluster.suggestedCategory === "Core Candidate" ||
          cluster.suggestedCategory === "Elective Candidate" ||
          cluster.suggestedCategory === "Review Required"
            ? cluster.suggestedCategory
            : getSuggestedCategory(suggestedName);

        const mappedCluster: AICluster = {
          id: `CL-${String(index + 1).padStart(2, "0")}`,
          suggestedName,
          confidence: buildConfidence(matchedCards.length),
          suggestedCategory,
          cardIds: matchedCards.map((card) => card.id),
          cards: matchedCards,
          notes:
            cluster.notes?.trim() ||
            "AI mengenal pasti tugasan ini sebagai satu kelompok kerja yang berkaitan.",
        };

        acc.push(mappedCluster);
        return acc;
      },
      []
    );

    const unmatchedCards = uniqueCards.filter(
      (card) => !usedCardIds.has(card.id)
    );

    const result: AIClusterResult = {
      totalCards: incomingCards.length,
      uniqueCards: uniqueCards.length,
      suggestedClusterCount: clusters.length,
      status: "ready",
      clusters,
      unmatchedCards,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("CCPC cluster API error:", error);

    return NextResponse.json(
      {
        error: "Failed to process CCPC clustering",
        status: "error",
      },
      { status: 500 }
    );
  }
}