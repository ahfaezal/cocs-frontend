"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { CCCItem } from "@/lib/ccc-types";
import { CCPCompetency } from "@/lib/ccc-mapper";
import { CCCDocumentMetaInput } from "@/lib/ccc-document-mapper";

interface CCCPageProps {
  ccpData: CCPCompetency[];
  value?: CCCItem[];
  onChange?: (items: CCCItem[]) => void;
  onGenerateAI?: (item: CCCItem) => void;
  documentMeta?: CCCDocumentMetaInput;
}

export function CCCPage(_props: CCCPageProps) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
          <AlertTriangle size={20} />
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">Paparan CCC lama telah ditamatkan</h2>
            <p className="mt-1 text-sm leading-6">
              CCC kini perlu dibina melalui workspace projek sebenar supaya data
              diambil daripada COS, CCPC dan CCP. Paparan template lama tidak lagi
              digunakan.
            </p>
          </div>

          <Link
            href={projectId ? `/ccc?projectId=${projectId}` : "/projects"}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Buka Workspace CCC
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
