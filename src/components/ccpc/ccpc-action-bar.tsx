"use client";

import { useRouter } from "next/navigation";
import {
  QrCode,
  ExternalLink,
  Snowflake,
  BadgeCheck,
  FileOutput,
} from "lucide-react";

import { DEFAULT_SESSION_ID } from "@/lib/env";

export function CCPCActionBar() {
  const router = useRouter();

  const sessionId = DEFAULT_SESSION_ID;

  const handleOpenPanelInput = () => {
    router.push(`/panel-input/${sessionId}`);
  };

  const handleGenerateQR = () => {
    router.push("/ccpc#qr-panel");
  };

  const handleFreezeBoard = () => {
    router.push("/ccpc/live-board");
  };

  const handleApproveCluster = () => {
    alert("Final Cluster berjaya diluluskan.");
  };

  const handleGenerateCCPC = () => {
    router.push("/ccpc-builder");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerateQR}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50"
        >
          <QrCode size={16} />
          Jana QR Panel
        </button>

        <button
          onClick={handleOpenPanelInput}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-slate-50"
        >
          <ExternalLink size={16} />
          Buka Panel Input
        </button>

        <button
          onClick={handleFreezeBoard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Snowflake size={16} />
          Freeze Board
        </button>

        <button
          onClick={handleApproveCluster}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <BadgeCheck size={16} />
          Approve Final Cluster
        </button>

        <button
          onClick={handleGenerateCCPC}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FileOutput size={16} />
          Generate CCPC
        </button>
      </div>
    </div>
  );
}