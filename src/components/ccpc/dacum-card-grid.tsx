"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/env";

type CCPCCard = {
  id: number;
  session_id: string;
  panel_name: string;
  task_text: string;
  status: string;
  created_at: string;
};

type DacumCardGridProps = {
  sessionId: string;
  sessionIds?: string[];
  sessionActive?: boolean;
  refreshActive?: boolean;
};

export function DacumCardGrid({
  sessionId,
  sessionIds = [],
  sessionActive = false,
  refreshActive = true,
}: DacumCardGridProps) {
  const [cards, setCards] = useState<CCPCCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const effectiveSessionIds = Array.from(
    new Set([sessionId, ...sessionIds].filter(Boolean))
  );
  const sessionIdsKey = effectiveSessionIds.join("|");

  useEffect(() => {
    if (!sessionActive || effectiveSessionIds.length === 0) return;

    let cancelled = false;

    async function loadCards() {
      try {
        setLoading(true);
        setError("");

        const cardGroups = await Promise.all(
          effectiveSessionIds.map(async (item) => {
            const res = await fetch(`${API_URL}/ccpc/cards/${item}`, {
              cache: "no-store",
            });

            if (!res.ok) {
              throw new Error("Gagal mendapatkan senarai kad DACUM.");
            }

            const data = await res.json();
            return Array.isArray(data) ? (data as CCPCCard[]) : [];
          })
        );

        if (!cancelled) {
          setCards(
            cardGroups
              .flat()
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
          );
        }
      } catch (error) {
        console.error("Gagal load DACUM cards:", error);

        if (!cancelled) {
          setError("Sambungan ke backend gagal. Sila semak API server.");
          setCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCards();

    const timer = refreshActive ? setInterval(loadCards, 3000) : undefined;

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [sessionActive, refreshActive, sessionIdsKey]);

  if (!sessionActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
          Memuatkan kad DACUM...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <>
          <div className="flex items-center justify-end gap-3">
            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              {cards.length} Kad
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
              <div
                key={`${card.id}-${card.created_at}`}
                className={`min-h-[110px] rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  index === 0
                    ? "border-emerald-400 ring-1 ring-emerald-300"
                    : "border-slate-200"
                }`}
              >
                <h3 className="text-base font-bold text-slate-950">
                  {card.task_text}
                </h3>

                <p className="mt-6 text-xs font-medium text-slate-400">
                  {new Date(card.created_at).toLocaleTimeString("en-MY", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>

                {index === 0 && (
                  <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Kad Terbaru
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && cards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Belum ada kad DACUM untuk session ini.
        </div>
      )}
    </div>
  );
}
