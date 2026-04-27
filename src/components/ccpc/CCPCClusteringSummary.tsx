"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const SESSION_ID = "bricklaying-level-3";

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
}

export function CCPCClusteringSummary({
  isRunning,
}: CCPCClusteringSummaryProps) {
  const [cards, setCards] = useState<CCPCCard[]>([]);
  const [clusters, setClusters] = useState<CCPCCluster[]>([]);

  async function loadSummary() {
    try {
      const cardsRes = await fetch(`${API_URL}/ccpc/cards/${SESSION_ID}`);
      const cardsData = await cardsRes.json();
      setCards(cardsData || []);

      const clustersRes = await fetch(`${API_URL}/ccpc/clusters/${SESSION_ID}`);
      const clustersData = await clustersRes.json();
      setClusters(clustersData || []);
    } catch (error) {
      console.error("Gagal load clustering summary:", error);
    }
  }

  useEffect(() => {
    loadSummary();

    const timer = setInterval(loadSummary, 3000);
    return () => clearInterval(timer);
  }, []);

  const totalCards = cards.length;
  const uniqueCards = new Set(cards.map((card) => card.task_text)).size;
  const suggestedClusterCount = clusters.length;

  const statusLabel = isRunning
    ? "Sedang Diproses"
    : suggestedClusterCount > 0
    ? "Selesai Diproses"
    : "Belum Dijana";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-blue-700">
          Kawalan AI Clustering
        </h3>
      </div>

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
          <p className="mt-2 text-xl font-bold text-emerald-700">
            {statusLabel}
          </p>
        </div>
      </div>
    </div>
  );
}