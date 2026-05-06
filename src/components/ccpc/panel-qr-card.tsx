"use client";

import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import {
  Check,
  Copy,
  Maximize2,
  RefreshCw,
  Smartphone,
  X,
} from "lucide-react";

type PanelQRCodeCardProps = {
  readOnly?: boolean;
  sessionId: string;
  sessionActive?: boolean;
  sessionClosed?: boolean;
};

export function PanelQRCodeCard({
  readOnly = false,
  sessionId,
  sessionActive = false,
  sessionClosed = false,
}: PanelQRCodeCardProps) {
  const [qrVersion, setQrVersion] = useState("");
  const [copied, setCopied] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const panelUrl = useMemo(() => {
    if (typeof window === "undefined" || !sessionActive || sessionClosed) {
      return "";
    }

    const baseUrl = `${window.location.origin}/panel-input/${sessionId}`;
    return qrVersion ? `${baseUrl}?t=${qrVersion}` : baseUrl;
  }, [qrVersion, sessionActive, sessionClosed, sessionId]);

  const qrReady = sessionActive && !sessionClosed && Boolean(panelUrl);

  async function copyLink() {
    if (readOnly || !qrReady) return;

    try {
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
    if (readOnly || !sessionActive || sessionClosed) return;
    setQrVersion(String(Date.now()));
  }

  function openFullScreen() {
    if (!qrReady) return;
    setFullScreen(true);
  }

  return (
    <div
      id="qr-panel"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
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
          {qrReady ? (
            <QRCode value={panelUrl} size={140} />
          ) : (
            <span className="px-4 text-center text-xs text-slate-400">
              {sessionClosed
                ? "Sesi telah ditutup."
                : "Aktifkan sesi untuk jana QR."}
            </span>
          )}
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Link Panel Input
          </label>

          <input
            value={panelUrl}
            readOnly
            placeholder="QR dan link akan dijana selepas sesi diaktifkan"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          />
        </div>

        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex gap-2">
            <Smartphone size={18} />
            <span>
              {sessionClosed
                ? "Sesi telah ditutup. Buka sesi baharu jika panel perlu menghantar input lagi."
                : sessionActive
                  ? "Panel hanya perlu scan QR ini menggunakan telefon."
                  : "Tekan Aktifkan Sesi untuk menjana QR Code panel."}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyLink}
            disabled={readOnly || !qrReady}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
            disabled={readOnly || !sessionActive || sessionClosed}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh QR
          </button>

          <button
            type="button"
            onClick={openFullScreen}
            disabled={!qrReady}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Maximize2 size={16} />
            Full Screen
          </button>
        </div>
      </div>

      {fullScreen ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6">
          <button
            type="button"
            onClick={() => setFullScreen(false)}
            className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X size={16} />
            Kembali
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              QR Code Panel Input
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Scan QR ini menggunakan telefon untuk menghantar DACUM Card.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <QRCode value={panelUrl} size={360} />
          </div>

          <div className="mt-6 max-w-3xl break-all rounded-2xl bg-slate-50 px-5 py-4 text-center text-sm font-medium text-slate-700">
            {panelUrl}
          </div>
        </div>
      ) : null}
    </div>
  );
}

