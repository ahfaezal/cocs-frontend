"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, RefreshCw, Smartphone } from "lucide-react";
import { DEFAULT_SESSION_ID } from "@/lib/env";

export function PanelQRCodeCard() {
  const [panelUrl, setPanelUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPanelUrl(
        `${window.location.origin}/panel-input/${DEFAULT_SESSION_ID}`
      );
    }
  }, []);

  async function copyLink() {
    try {
      if (!panelUrl) return;

      await navigator.clipboard.writeText(panelUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Gagal copy link:", error);
      alert("Gagal menyalin link.");
    }
  }

  function refreshQR() {
    if (typeof window !== "undefined") {
      setPanelUrl(
        `${window.location.origin}/panel-input/${DEFAULT_SESSION_ID}?t=${Date.now()}`
      );
    }
  }

  return (
    <div id="qr-panel" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-blue-700">
          QR Code & Panel Input
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ahli panel scan QR untuk hantar DACUM Card secara langsung.
        </p>
      </div>

      <div className="px-5 py-5">
        <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-4">
          {panelUrl ? (
            <QRCode value={panelUrl} size={140} />
          ) : (
            <span className="text-xs text-slate-400">Loading QR...</span>
          )}
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Link Panel Input
          </label>

          <input
            value={panelUrl}
            readOnly
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          />
        </div>

        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex gap-2">
            <Smartphone size={18} />
            <span>Panel hanya perlu scan QR ini menggunakan telefon.</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyLink}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              copied
                ? "bg-emerald-100 text-emerald-700"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Berjaya Disalin" : "Copy Link"}
          </button>

          <button
            type="button"
            onClick={refreshQR}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh QR
          </button>
        </div>
      </div>
    </div>
  );
}