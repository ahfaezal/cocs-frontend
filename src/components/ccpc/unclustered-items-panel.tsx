"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const SESSION_ID = "bricklaying-level-3";

type CCPCCard = {
  id: number;
  session_id: string;
  panel_name: string;
  task_text: string;
  status: string;
  created_at: string;
};

export function UnclusteredItemsPanel() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    try {
      const res = await fetch(`${API_URL}/ccpc/cards/${SESSION_ID}`);
      const data: CCPCCard[] = await res.json();

      const latest = data.slice(0, 6).map((item) => item.task_text);

      setItems(latest);
    } catch (error) {
      console.error("Gagal load unclustered items:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();

    const timer = setInterval(() => {
      loadItems();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
      <div className="border-b border-amber-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-700">
            Item Belum Dipadankan
          </h2>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
            Live Queue
          </span>
        </div>
      </div>

      <div className="space-y-3 px-5 py-5">
        {loading && (
          <p className="text-sm text-amber-700/70">
            Memuatkan item...
          </p>
        )}

        {!loading && items.length === 0 && (
          <p className="text-sm text-amber-700/70">
            Tiada item menunggu padanan.
          </p>
        )}

        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}