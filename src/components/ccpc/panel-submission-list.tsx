"use client";

import { useEffect, useState } from "react";
import { Award, Medal, Trophy } from "lucide-react";
import { API_URL } from "@/lib/env";

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

type PanelSubmissionListProps = {
  sessionId: string;
  sessionActive?: boolean;
};

const RANK_STYLES = [
  {
    label: "Leader",
    Icon: Trophy,
    container: "border-amber-300 bg-amber-50 ring-1 ring-amber-200",
    badge: "bg-amber-500 text-white",
    icon: "bg-amber-100 text-amber-700",
  },
  {
    label: "No. 2",
    Icon: Medal,
    container: "border-blue-300 bg-blue-50 ring-1 ring-blue-100",
    badge: "bg-blue-600 text-white",
    icon: "bg-blue-100 text-blue-700",
  },
  {
    label: "No. 3",
    Icon: Award,
    container: "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-100",
    badge: "bg-emerald-600 text-white",
    icon: "bg-emerald-100 text-emerald-700",
  },
];

export function PanelSubmissionList({
  sessionId,
  sessionActive = false,
}: PanelSubmissionListProps) {
  const [items, setItems] = useState<PanelSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!sessionActive || !sessionId) return;

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await fetch(`${API_URL}/ccpc/cards/${sessionId}`, {
          cache: "no-store",
        });

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

        if (!cancelled) {
          setItems(result);
        }
      } catch (error) {
        console.error("Gagal load panel summary:", error);

        if (!cancelled) {
          setErrorMessage("Sambungan ke backend gagal. Sila semak API server.");
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    const timer = setInterval(loadData, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sessionActive, sessionId]);

  if (!sessionActive || (!loading && !errorMessage && items.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-blue-700">
              Ringkasan Input Panel
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kedudukan panel mengikut jumlah input untuk menggalakkan sumbangan aktif.
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

        {!loading &&
          !errorMessage &&
          items.map((item, index) => {
            const rankStyle = RANK_STYLES[index];
            const Icon = rankStyle?.Icon;

            return (
            <div
              key={item.name}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition hover:bg-slate-50 ${
                rankStyle?.container || "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {Icon ? (
                  <div className={`rounded-xl p-2 ${rankStyle.icon}`}>
                    <Icon size={18} />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
                    {index + 1}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {item.name}
                    </span>

                    {rankStyle ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${rankStyle.badge}`}>
                        {rankStyle.label}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Kad dihantar: {item.cards}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Aktif
                </div>

                <div className="mt-1 text-xs text-slate-500">{item.last}</div>
              </div>
            </div>
            );
          })}
      </div>
    </div>
  );
}
