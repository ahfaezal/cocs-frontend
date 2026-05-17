"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/env";

export default function PanelInputPage() {
  const params = useParams();
  const session = params.session as string;

  const [panelName, setPanelName] = useState("");
  const [panelPosition, setPanelPosition] = useState("");
  const [panelOrganization, setPanelOrganization] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!session || !panelName.trim()) {
      setSubmittedCount(0);
      return;
    }

    let cancelled = false;

    async function loadPanelCount() {
      try {
        const res = await fetch(`${API_URL}/ccpc/cards/${session}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        const cards = Array.isArray(data) ? data : [];
        const currentPanelName = panelName.trim().toLowerCase();
        const count = cards.filter(
          (card) =>
            String(card.panel_name || "").trim().toLowerCase() ===
            currentPanelName
        ).length;

        if (!cancelled) {
          setSubmittedCount(count);
        }
      } catch (error) {
        console.error("Gagal mendapatkan jumlah kad panel:", error);
      }
    }

    loadPanelCount();

    return () => {
      cancelled = true;
    };
  }, [panelName, session]);

  async function handleSubmit() {
    if (!task.trim()) return;

    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      const res = await fetch(`${API_URL}/ccpc/card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: session,
          panel_name: panelName.trim() || "Panel",
          panel_position: panelPosition.trim(),
          panel_organization: panelOrganization.trim(),
          task_text: task.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal hantar kad");
      }

      const nextCount = submittedCount + 1;

      setSubmittedCount(nextCount);
      setTask("");
      setSuccessMessage(
        `${nextCount} Kad DACUM berjaya dihantar ke Live Board.`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Gagal hantar kad. Pastikan backend sedang berjalan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-5">
          <p className="text-sm font-semibold text-blue-600">
            Digital DACUM Panel Input
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Session ID: {session}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Nama Panel
          </label>

          <input
            value={panelName}
            onChange={(e) => setPanelName(e.target.value)}
            placeholder="Prof. Mayda Ts. Dr. Ahmad Albab"
            className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Jawatan
          </label>

          <input
            value={panelPosition}
            onChange={(e) => setPanelPosition(e.target.value)}
            placeholder="Supervisor/Technician/Welder"
            className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Organisasi
          </label>

          <input
            value={panelOrganization}
            onChange={(e) => setPanelOrganization(e.target.value)}
            placeholder="Pembinaan Sdn Bhd/Universiti Malaysia"
            className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Aktiviti / Tugasan Kerja
          </label>

          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={5}
            placeholder="Contoh: Laksana Pembersihan Kawasan"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <p className="mt-2 text-xs font-medium text-slate-500">
            Setiap ayat perlu dimulakan dengan Kata Kerja.
          </p>

          {successMessage && (
            <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !task.trim()}
            className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Menghantar..." : "Hantar Kad DACUM"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Kad yang dihantar akan dipaparkan terus di Live Board fasilitator.
        </p>
      </div>
    </main>
  );
}
