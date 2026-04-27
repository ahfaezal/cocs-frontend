"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Monitor,
  Play,
  RefreshCw,
  Snowflake,
} from "lucide-react";

import { DacumCardGrid } from "@/components/ccpc/dacum-card-grid";
import { DEFAULT_SESSION_ID } from "@/lib/env";

export default function LiveBoardPage() {
  const [freeze, setFreeze] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Monitor size={20} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Live Board (DACUM Card)
              </h1>

              <p className="text-sm text-slate-500">
                Session: {DEFAULT_SESSION_ID}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ccpc"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Kembali ke CCPC
            </Link>

            <button
              type="button"
              onClick={() => setFreeze(!freeze)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                freeze
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {freeze ? <Play size={16} /> : <Snowflake size={16} />}
              {freeze ? "Unfreeze" : "Freeze"}
            </button>

            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              <RefreshCw size={14} />
              Auto Refresh
            </span>
          </div>
        </div>
      </div>

      {freeze && (
        <div className="border-b border-amber-200 bg-amber-50 px-8 py-3 text-sm font-medium text-amber-700">
          Freeze Mode aktif — paparan dikekalkan untuk semakan fasilitator.
        </div>
      )}

      <div className="p-6">
        <DacumCardGrid />
      </div>
    </main>
  );
}