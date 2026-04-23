import { NextRequest, NextResponse } from "next/server";
import { AICluster, AIClusterResult, DACUMCard } from "@/lib/ccpc-ai-types";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 2);
}

function getClusterCategory(clusterName: string): AICluster["suggestedCategory"] {
  const text = clusterName.toLowerCase();

  if (
    text.includes("operasi") ||
    text.includes("pengurusan") ||
    text.includes("keselamatan") ||
    text.includes("pentadbiran") ||
    text.includes("kewangan")
  ) {
    return "Core Candidate";
  }

  if (
    text.includes("program") ||
    text.includes("dakwah") ||
    text.includes("sukarelawan") ||
    text.includes("komuniti")
  ) {
    return "Elective Candidate";
  }

  return "Review Required";
}

function buildClusterName(cards: DACUMCard[]): string {
  const joined = cards.map((card) => normalizeText(card.text)).join(" ");

  if (
    joined.includes("operasi") ||
    joined.includes("jadual") ||
    joined.includes("imam") ||
    joined.includes("solat")
  ) {
    return "Pengurusan Operasi Harian Masjid";
  }

  if (
    joined.includes("dokumen") ||
    joined.includes("rekod") ||
    joined.includes("surat") ||
    joined.includes("resit")
  ) {
    return "Pentadbiran & Rekod Rasmi";
  }

  if (
    joined.includes("kewangan") ||
    joined.includes("resit") ||
    joined.includes("bayaran") ||
    joined.includes("peruntukan")
  ) {
    return "Pengurusan Kewangan Masjid";
  }

  if (
    joined.includes("program") ||
    joined.includes("aktiviti") ||
    joined.includes("dakwah") ||
    joined.includes("majlis")
  ) {
    return "Pengendalian Program & Dakwah";
  }

  if (
    joined.includes("fasiliti") ||
    joined.includes("keselamatan") ||
    joined.includes("penyelenggaraan") ||
    joined.includes("kerosakan")
  ) {
    return "Keselamatan, Fasiliti & Sokongan";
  }

  const first = cards[0]?.text || "Cluster Umum";
  return first;
}

function calculateConfidence(cards: DACUMCard[]): number {
  if (cards.length >= 8) return 92;
  if (cards.length >= 6) return 89;
  if (cards.length >= 4) return 86;
  if (cards.length >= 2) return 80;
  return 72;
}

function similarityScore(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = [...tokensA].filter((token) => tokensB.has(token)).length;
  const union = new Set([...tokensA, ...tokensB]).size;

  return intersection / union;
}

function groupCards(cards: DACUMCard[]): {
  grouped: DACUMCard[][];
  unmatched: DACUMCard[];
} {
  const visited = new Set<string>();
  const groups: DACUMCard[][] = [];
  const unmatched: DACUMCard[] = [];

  for (let i = 0; i < cards.length; i++) {
    const base = cards[i];
    if (visited.has(base.id)) continue;

    const currentGroup = [base];
    visited.add(base.id);

    for (let j = i + 1; j < cards.length; j++) {
      const candidate = cards[j];
      if (visited.has(candidate.id)) continue;

      const score = similarityScore(base.text, candidate.text);

      if (score >= 0.35) {
        currentGroup.push(candidate);
        visited.add(candidate.id);
      }
    }

    if (currentGroup.length === 1) {
      unmatched.push(base);
    } else {
      groups.push(currentGroup);
    }
  }

  return { grouped: groups, unmatched };
}

function buildClusters(groups: DACUMCard[][]): AICluster[] {
  return groups.map((cards, index) => {
    const suggestedName = buildClusterName(cards);

    return {
      id: `CL-${String(index + 1).padStart(2, "0")}`,
      suggestedName,
      confidence: calculateConfidence(cards),
      suggestedCategory: getClusterCategory(suggestedName),
      cardIds: cards.map((card) => card.id),
      cards,
      notes:
        cards.length >= 4
          ? "AI mengenal pasti tema tugasan yang hampir sama dalam cluster ini."
          : "Cluster ini wajar disemak semula oleh fasilitator.",
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cards = (body.cards || []) as DACUMCard[];

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: "cards is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    const seen = new Set<string>();
    const uniqueCards = cards.filter((card) => {
      const key = normalizeText(card.text);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const { grouped, unmatched } = groupCards(uniqueCards);
    const clusters = buildClusters(grouped);

    const result: AIClusterResult = {
      totalCards: cards.length,
      uniqueCards: uniqueCards.length,
      suggestedClusterCount: clusters.length,
      status: "ready",
      clusters,
      unmatchedCards: unmatched,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("CCPC cluster API error:", error);

    return NextResponse.json(
      {
        error: "Failed to process clustering",
        status: "error",
      },
      { status: 500 }
    );
  }
}