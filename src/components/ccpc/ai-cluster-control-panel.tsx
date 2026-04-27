"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { API_URL, DEFAULT_SESSION_ID } from "@/lib/env";

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

export function AIClusterControlPanel() {
  const [cards, setCards] = useState<CCPCCard[]>([]);
  const [clusters, setClusters] = useState<CCPCCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    try {
      setErrorMessage("");

      const cardsRes = await fetch(
        `${API_URL}/ccpc/cards/${DEFAULT_SESSION_ID}`,
        { cache: "no-store" }
      );

      if (!cardsRes.ok) {
        throw new Error("Gagal mendapatkan kad DACUM.");
      }

      const cardsData = await cardsRes.json();
      setCards(Array.isArray(cardsData) ? cardsData : []);

      const clusterRes = await fetch(
        `${API_URL}/ccpc/clusters/${DEFAULT_SESSION_ID}`,
        { cache: "no-store" }
      );

      if (!clusterRes.ok) {
        setClusters([]);
        return;
      }

      const clusterData = await clusterRes.json();
      setClusters(Array.isArray(clusterData) ? clusterData : []);
    } catch (error) {
      console.error("Gagal load data AI clustering:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
    }
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 3000);

    return () => clearInterval(timer);
  }, []);

  async function runAIClustering() {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch(`${API_URL}/ccpc/cluster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: DEFAULT_SESSION_ID,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menjalankan AI clustering.");
      }

      await loadData();
    } catch (error) {
      console.error("AI clustering gagal dijalankan:", error);
      setErrorMessage("AI clustering gagal dijalankan. Sila cuba semula.");
    } finally {
      setLoading(false);
    }
  }

  const uniqueCards = new Set(cards.map((card) => card.task_text)).size;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-blue-700">
            Kawalan AI Clustering
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            AI akan mengelompokkan kad yang hampir sama, mencadangkan nama
            cluster, dan mengenal pasti item yang belum sesuai diletakkan dalam
            mana-mana cluster.
          </p>
        </div>

        <button
          type="button"
          onClick={runAIClustering}
          disabled={loading || cards.length === 0}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Running AI..." : "Run AI Clustering"}
        </button>
      </div>

      <div className="space-y-5 px-5 py-5">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-blue-700">
              Ringkasan AI Clustering
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Jumlah Kad Input</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {cards.length}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Kad Unik</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {uniqueCards}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Cluster Dicadangkan</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {clusters.length}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Status AI</div>
              <div className="mt-2 text-lg font-bold text-emerald-700">
                {clusters.length > 0 ? "Selesai Diproses" : "Belum Dijana"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <Bot size={18} className="mt-0.5 text-blue-700" />
            <p className="text-sm leading-6 text-slate-600">
              Statistik ini dibaca terus daripada database live: jumlah kad
              daripada Panel Input dan jumlah cluster daripada hasil AI
              Clustering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}