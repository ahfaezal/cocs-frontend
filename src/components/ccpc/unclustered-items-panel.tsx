"use client";

import { useEffect, useState } from "react";
import { API_URL, DEFAULT_SESSION_ID } from "@/lib/env";

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
  const [errorMessage, setErrorMessage] = useState("");

  async function loadItems() {
    try {
      setErrorMessage("");

      const res = await fetch(
        `${API_URL}/ccpc/cards/${DEFAULT_SESSION_ID}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Gagal mendapatkan item belum dipadankan.");
      }

      const data: CCPCCard[] = await res.json();

      const latest = Array.isArray(data)
        ? data.slice(0, 6).map((item) => item.task_text)
        : [];

      setItems(latest);
    } catch (error) {
      console.error("Gagal load unclustered items:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
      setItems([]);
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-amber-700">
              Item Belum Dipadankan
            </h2>

            <p className="mt-1 text-sm text-amber-700/70">
              Senarai item terkini yang belum dimuktamadkan dalam cluster.
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
            Live Queue
          </span>
        </div>
      </div>

      <div className="space-y-3 px-5 py-5">
        {loading && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-white px-4 py-3 text-sm text-amber-700/70">
            Memuatkan item...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-white px-4 py-3 text-sm text-amber-700/70">
            Tiada item menunggu padanan.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          items.map((item, index) => (
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