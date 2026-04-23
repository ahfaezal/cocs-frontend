export interface DACUMCard {
  id: string;
  text: string;
  panelName?: string;
  timestamp?: string;
}

export type ClusterSuggestionCategory =
  | "Core Candidate"
  | "Elective Candidate"
  | "Review Required";

export interface AICluster {
  id: string;
  suggestedName: string;
  confidence: number;
  suggestedCategory: ClusterSuggestionCategory;
  cardIds: string[];
  cards: DACUMCard[];
  notes: string;
}

export interface AIClusterResult {
  totalCards: number;
  uniqueCards: number;
  suggestedClusterCount: number;
  status: "ready" | "processing" | "error";
  clusters: AICluster[];
  unmatchedCards: DACUMCard[];
}