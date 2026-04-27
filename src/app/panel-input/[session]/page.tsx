"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/env";

export default function PanelInputPage() {
  const params = useParams();
  const session = params.session as string;

  const [panelName, setPanelName] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
          task_text: task.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal hantar kad");
      }

      setTask("");
      setSuccessMessage("Kad DACUM berjaya dihantar ke Live Board.");
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

          <h1 className="text-xl font-bold text-slate-900">
            Bricklaying (Wet Trade) Level 3
          </h1>

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
            placeholder="Contoh: Panel 1"
            className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Aktiviti / Tugasan Kerja
          </label>

          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={5}
            placeholder="Contoh: Menyusun bata mengikut garisan tapak..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

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