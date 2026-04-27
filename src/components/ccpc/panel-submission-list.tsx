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

type PanelSummary = {
  name: string;
  cards: number;
  last: string;
};

export function PanelSubmissionList() {
  const [items, setItems] = useState<PanelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    try {
      setErrorMessage("");

      const res = await fetch(
        `${API_URL}/ccpc/cards/${DEFAULT_SESSION_ID}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Gagal mendapatkan data panel.");
      }

      const data: CCPCCard[] = await res.json();

      const grouped: Record<string, PanelSummary> = {};

      data.forEach((card) => {
        const name = card.panel_name?.trim() || "Panel";

        if (!grouped[name]) {
          grouped[name] = {
            name,
            cards: 0,
            last: card.created_at,
          };
        }

        grouped[name].cards += 1;

        if (card.created_at > grouped[name].last) {
          grouped[name].last = card.created_at;
        }
      });

      const result = Object.values(grouped)
        .map((item) => ({
          ...item,
          last: new Date(item.last).toLocaleTimeString("en-MY", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
        .sort((a, b) => b.cards - a.cards);

      setItems(result);
    } catch (error) {
      console.error("Gagal load panel summary:", error);
      setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-blue-700">
              Ringkasan Input Panel
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Aktiviti penghantaran DACUM Card secara langsung.
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Live Refresh
          </span>
        </div>
      </div>

      <div className="space-y-3 px-5 py-5">
        {loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
            Memuatkan data...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
            Tiada input panel lagi.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  {item.name}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Kad dihantar: {item.cards}
                </div>
              </div>

              <div className="text-right">
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Aktif
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {item.last}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}