"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/env";

type CCPCCard = {
  id: number;
  task_text: string;
};

type CCPCCluster = {
  id: number;
  clusterName: string;
  suggestedCategory: string;
  items: string[];
};

interface CCPCClusteringSummaryProps {
  result: unknown;
  isRunning: boolean;
  sessionId: string;
  sessionIds?: string[];
  sessionActive?: boolean;
  refreshActive?: boolean;
}

export function CCPCClusteringSummary({
  isRunning,
  sessionId,
  sessionIds = [],
  sessionActive = false,
  refreshActive = false,
}: CCPCClusteringSummaryProps) {
  const [cards, setCards] = useState<CCPCCard[]>([]);
  const [clusters, setClusters] = useState<CCPCCluster[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const effectiveSessionIds = [
    sessionId,
    ...sessionIds,
  ].filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index;
  });

  useEffect(() => {
    if (!sessionActive || effectiveSessionIds.length === 0) return;

    let cancelled = false;

    async function loadSummary() {
      try {
        setErrorMessage("");

        const cardGroups = await Promise.all(
          effectiveSessionIds.map(async (currentSessionId) => {
            const cardsRes = await fetch(`${API_URL}/ccpc/cards/${currentSessionId}`, {
              cache: "no-store",
            });

            if (!cardsRes.ok) {
              throw new Error("Gagal mendapatkan kad DACUM.");
            }

            const cardsData = await cardsRes.json();
            return Array.isArray(cardsData) ? cardsData : [];
          })
        );

        if (!cancelled) {
          setCards(cardGroups.flat());
        }

        const clustersRes = await fetch(`${API_URL}/ccpc/clusters/${sessionId}`, {
          cache: "no-store",
        });

        if (!clustersRes.ok) {
          if (!cancelled) {
            setClusters([]);
          }
          return;
        }

        const clustersData = await clustersRes.json();

        if (!cancelled) {
          setClusters(Array.isArray(clustersData) ? clustersData : []);
        }
      } catch (error) {
        console.error("Gagal load clustering summary:", error);

        if (!cancelled) {
          setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
          setCards([]);
          setClusters([]);
        }
      }
    }

    loadSummary();

    const timer = refreshActive ? setInterval(loadSummary, 3000) : null;

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [refreshActive, sessionActive, sessionId, effectiveSessionIds.join("|")]);

  const totalCards = sessionActive ? cards.length : 0;
  const uniqueCards = sessionActive
    ? new Set(cards.map((card) => card.task_text)).size
    : 0;
  const suggestedClusterCount = sessionActive ? clusters.length : 0;

  const statusLabel = !sessionActive
    ? "Belum Bermula"
    : isRunning
      ? "Sedang Diproses"
      : suggestedClusterCount > 0
        ? "Selesai Diproses"
        : "Belum Dijana";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-blue-700">
          Ringkasan AI Clustering
        </h3>
      </div>

      {errorMessage && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 p-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Jumlah Kad Input</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {totalCards}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Kad Unik</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {uniqueCards}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Cluster Dicadangkan</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {suggestedClusterCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">Status AI</p>
          <p
            className={`mt-2 text-xl font-bold ${
              isRunning
                ? "text-amber-600"
                : suggestedClusterCount > 0
                  ? "text-emerald-700"
                  : "text-slate-600"
            }`}
          >
            {statusLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
