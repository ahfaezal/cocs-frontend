"use client";

import { useEffect, useState } from "react";
import { CircleDot, Clock3, StickyNote, Users } from "lucide-react";
import { API_URL } from "@/lib/env";

type SessionStatus = "draft" | "active" | "closed";

type DacumSessionCardProps = {
  standardTitle?: string;
  readOnly?: boolean;
  sessionId?: string;
  sessionStatus?: SessionStatus;
  onActivateSession?: () => void;
  onCloseSession?: () => void;
};

type CCPCCard = {
  id: number;
  panel_name: string;
  task_text: string;
  created_at: string;
};

const statusConfig: Record<
  SessionStatus,
  { label: string; className: string; helper: string }
> = {
  draft: {
    label: "Draf / Belum Aktif",
    className: "text-amber-700",
    helper: "Aktifkan sesi untuk menjana QR Code panel.",
  },
  active: {
    label: "Live / Aktif",
    className: "text-emerald-700",
    helper: "Panel boleh scan QR dan menghantar DACUM Card.",
  },
  closed: {
    label: "Ditutup",
    className: "text-red-700",
    helper: "Sesi telah ditutup dan QR Code tidak lagi aktif.",
  },
};

export function DacumSessionCard({
  standardTitle,
  readOnly = false,
  sessionId = "",
  sessionStatus = "draft",
  onActivateSession,
  onCloseSession,
}: DacumSessionCardProps) {
  const finalStandardTitle = standardTitle || "Belum ditetapkan";
  const currentStatus = statusConfig[sessionStatus];
  const [cardCount, setCardCount] = useState(0);
  const [panelCount, setPanelCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setCardCount(0);
      setPanelCount(0);
      return;
    }

    let cancelled = false;

    async function loadCounts() {
      try {
        const res = await fetch(`${API_URL}/ccpc/cards/${sessionId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Gagal mendapatkan kiraan kad DACUM.");
        }

        const data: CCPCCard[] = await res.json();
        const cards = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setCardCount(cards.length);
          setPanelCount(
            new Set(
              cards
                .map((card) => card.panel_name?.trim())
                .filter((name): name is string => Boolean(name))
            ).size
          );
        }
      } catch (error) {
        console.error("Gagal load kiraan sesi DACUM:", error);

        if (!cancelled) {
          setCardCount(0);
          setPanelCount(0);
        }
      }
    }

    loadCounts();

    const timer = window.setInterval(loadCounts, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sessionId]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          Maklumat Sesi DACUM
        </h2>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Tajuk Standard
          </div>

          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
            value={finalStandardTitle}
            readOnly
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CircleDot size={16} />
              Status Sesi
            </div>
            <div className={`mt-2 text-lg font-semibold ${currentStatus.className}`}>
              {currentStatus.label}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {currentStatus.helper}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock3 size={16} />
              Mula Sesi
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              21 Mei 2026, 9:00 AM
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={16} />
              Jumlah Panel
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {panelCount} Panel
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <StickyNote size={16} />
              Kad Diterima
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {cardCount} Kad
            </div>
          </div>
        </div>

        {readOnly ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Mode semakan: Pegawai Penilai hanya boleh melihat maklumat sesi.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onActivateSession}
              disabled={sessionStatus === "active"}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sessionStatus === "active" ? "Sesi Aktif" : "Aktifkan Sesi"}
            </button>

            <button
              type="button"
              onClick={onCloseSession}
              disabled={sessionStatus !== "active"}
              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tutup Sesi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
