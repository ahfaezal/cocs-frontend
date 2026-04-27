"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, GitMerge, RotateCcw, Bot } from "lucide-react";

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

export function AIClusterControlPanel() {
  const [cards, setCards] = useState<CCPCCard[]>([]);
  const [clusters, setClusters] = useState<CCPCCluster[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const cardsRes = await fetch(`${API_URL}/ccpc/cards/${SESSION_ID}`);
    const cardsData = await cardsRes.json();
    setCards(cardsData || []);

    const clusterRes = await fetch(`${API_URL}/ccpc/clusters/${SESSION_ID}`);
    const clusterData = await clusterRes.json();
    setClusters(clusterData || []);
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 3000);
    return () => clearInterval(timer);
  }, []);

  async function runAIClustering() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/ccpc/cluster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: SESSION_ID,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menjalankan AI clustering");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("AI clustering gagal dijalankan.");
    } finally {
      setLoading(false);
    }
  }

  const uniqueCards = new Set(cards.map((card) => card.task_text)).size;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-blue-700">
            Kawalan AI Clustering
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            AI akan mengelompokkan kad yang hampir sama, mencadangkan nama cluster, dan mengenal pasti item yang belum sesuai diletakkan dalam mana-mana cluster.
          </p>
        </div>

        <button
          onClick={runAIClustering}
          disabled={loading || cards.length === 0}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:bg-slate-400"
        >
          {loading ? "Running AI..." : "Run AI Clustering"}
        </button>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-blue-700">
              Kawalan AI Clustering
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
              Statistik ini dibaca terus daripada database live: jumlah kad daripada Panel Input dan jumlah cluster daripada hasil AI Clustering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}