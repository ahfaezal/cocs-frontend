import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AICluster, AIClusterResult, DACUMCard } from "@/lib/ccpc-ai-types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const key = normalizeText(card.text);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getSuggestedCategory(name: string): AICluster["suggestedCategory"] {
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

function buildConfidence(clusterSize: number, totalCards: number): number {
  if (clusterSize >= 6) return 92;
  if (clusterSize >= 4) return 88;
  if (clusterSize >= 3) return 84;
  if (clusterSize >= 2) return 80;
  return totalCards > 10 ? 72 : 75;
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

type OpenAIClusterDraft = {
  clusterName: string;
  items: string[];
  notes?: string;
  suggestedCategory?: string;
};

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
      console.warn("Missing OPENAI_API_KEY. Returning fallback result.");

      return NextResponse.json(buildFallbackResult(uniqueCards));
    }

    const cardList = uniqueCards
      .map((card, index) => `${index + 1}. ${card.text}`)
      .join("\n");

    const prompt = `
Anda ialah pakar Occupational Analysis, DACUM, NOSS, dan pembangunan standard kompetensi kerja di Malaysia.

Tugas anda:
1. Kelompokkan senarai tugas DACUM di bawah kepada beberapa cluster kompetensi kerja yang logik.
2. Setiap cluster mesti mengandungi tugasan yang benar-benar berkaitan.
3. Jangan paksa semua item masuk cluster. Jika item terlalu umum / terpencil / kurang jelas, biarkan ia tidak dipadankan.
4. Cadangkan nama cluster yang ringkas, profesional, dan sesuai untuk competency analysis.
5. Cadangkan kategori:
   - "Core Candidate"
   - "Elective Candidate"
   - "Review Required"

Pulangkan jawapan dalam JSON ARRAY SAHAJA.
Jangan beri penerangan lain.
Jangan bungkus dengan markdown.

Format wajib:
[
  {
    "clusterName": "Pengurusan Operasi Harian Masjid",
    "suggestedCategory": "Core Candidate",
    "notes": "Cluster ini menghimpunkan tugasan operasi asas harian masjid.",
    "items": [
      "Pantau perjalanan program masjid",
      "Sedia jadual tugas bilal"
    ]
  }
]

Senarai tugas DACUM:
${cardList}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Anda pakar analisis kompetensi kerja, DACUM, NOSS, dan TVET Malaysia. Anda mesti memulangkan JSON yang sah sahaja.",
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

    const clusters: AICluster[] = parsed
      .map((cluster, index) => {
        const matchedCards = uniqueCards.filter((card) =>
          (cluster.items || []).some(
            (itemText) =>
              normalizeText(itemText) === normalizeText(card.text)
          )
        );

        matchedCards.forEach((card) => usedCardIds.add(card.id));

        if (matchedCards.length === 0) return null;

        const suggestedName =
          cluster.clusterName?.trim() || `Cluster ${index + 1}`;

        const suggestedCategory =
          cluster.suggestedCategory === "Core Candidate" ||
          cluster.suggestedCategory === "Elective Candidate" ||
          cluster.suggestedCategory === "Review Required"
            ? cluster.suggestedCategory
            : getSuggestedCategory(suggestedName);

        return {
          id: `CL-${String(index + 1).padStart(2, "0")}`,
          suggestedName,
          confidence: buildConfidence(matchedCards.length, uniqueCards.length),
          suggestedCategory,
          cardIds: matchedCards.map((card) => card.id),
          cards: matchedCards,
          notes:
            cluster.notes?.trim() ||
            "AI mengenal pasti tugasan ini sebagai satu kelompok kerja yang berkaitan.",
        } satisfies AICluster;
      })
      .filter((cluster): cluster is AICluster => cluster !== null);

    const unmatchedCards = uniqueCards.filter((card) => !usedCardIds.has(card.id));

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