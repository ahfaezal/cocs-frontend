"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock3, ClipboardCheck } from "lucide-react";
import { CCCItem } from "@/lib/ccc-types";
import { mapCCPToCCC, CCPCompetency } from "@/lib/ccc-mapper";
import {
  mapCCPToCCCDocument,
  CCCDocumentMetaInput,
} from "@/lib/ccc-document-mapper";
import { CCCCard } from "@/components/curriculum/CCCCard";
import { CCCModeSwitcher } from "./CCCModeSwitcher";
import { CCCDocumentView } from "./CCCDocumentView";

interface CCCPageProps {
  ccpData: CCPCompetency[];
  value?: CCCItem[];
  onChange?: (items: CCCItem[]) => void;
  onGenerateAI?: (item: CCCItem) => void;
  documentMeta?: CCCDocumentMetaInput;
}

type CCCMode = "builder" | "document";

export function CCCPage({
  ccpData,
  value,
  onChange,
  onGenerateAI,
  documentMeta,
}: CCCPageProps) {
  const initialItems = useMemo(() => {
    if (value && value.length > 0) return value;
    return mapCCPToCCC(ccpData);
  }, [ccpData, value]);

  const [items, setItems] = useState<CCCItem[]>(initialItems);
  const [mode, setMode] = useState<CCCMode>("builder");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const documentData = useMemo(() => {
    return mapCCPToCCCDocument(
      ccpData,
      {
        section: documentMeta?.section || "",
        group: documentMeta?.group || "",
        area: documentMeta?.area || "",
        cocsTitle: documentMeta?.cocsTitle || "",
        competencyTitle:
          documentMeta?.competencyTitle ||
          ccpData?.[0]?.title ||
          "Competency Title",
        competencyCode: documentMeta?.competencyCode || "XXX-C01",
        cocsLevel: documentMeta?.cocsLevel || "Two (2)",
        trainingPrerequisite:
          documentMeta?.trainingPrerequisite || "Not available.",
      },
      items
    );
  }, [ccpData, documentMeta, items]);

  const totalHours = items.reduce(
    (sum, item) => sum + (Number(item.trainingHours) || 0),
    0
  );

  const handleUpdateItems = (nextItems: CCCItem[]) => {
    setItems(nextItems);
    onChange?.(nextItems);
  };

  const handleUpdateItem = (updatedItem: CCCItem) => {
    const nextItems = items.map((row) =>
      row.id === updatedItem.id ? updatedItem : row
    );
    handleUpdateItems(nextItems);
  };

  const handleGenerateAI = async (item: CCCItem) => {
    try {
      setGeneratingId(item.id);

      const response = await fetch("/api/ccc/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competencyTitle: item.competencyTitle,
          cuTitle: item.cuTitle,
          workStepTitle: item.workStepTitle,
          performanceCriteriaTexts: item.performanceCriteriaTexts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI content");
      }

      const aiResult = await response.json();

      const updatedItem: CCCItem = {
        ...item,
        learningOutcomes:
          aiResult.learningOutcomes?.length > 0
            ? aiResult.learningOutcomes
            : item.learningOutcomes,
        trainingHours:
          typeof aiResult.trainingHours === "number"
            ? aiResult.trainingHours
            : item.trainingHours,
        assessmentMethods:
          aiResult.assessmentMethods?.length > 0
            ? aiResult.assessmentMethods
            : item.assessmentMethods,
        aiSuggested: {
          learningOutcomes: aiResult.learningOutcomes || [],
          knowledgeItems: aiResult.knowledgeItems || [],
          attitudeItems: aiResult.attitudeItems || [],
          safetyItems: aiResult.safetyItems || [],
          environmentItems: aiResult.environmentItems || [],
          assessmentMethods: aiResult.assessmentMethods || [],
          trainingHours: aiResult.trainingHours,
        },
      };

      handleUpdateItem(updatedItem);
      onGenerateAI?.(updatedItem);
    } catch (error) {
      console.error(error);
      alert("AI generation gagal. Sila cuba semula.");
    } finally {
      setGeneratingId(null);
    }
  };

  const isEmpty = items.length === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <BookOpen size={18} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Curriculum / Course Content Component
              </h2>
              <p className="text-sm text-slate-500">
                Bina kandungan kurikulum berdasarkan Competency, CU, Work Step dan
                Performance Criteria daripada CCP.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <ClipboardCheck size={16} />
              <span>{items.length} item CCC</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <Clock3 size={16} />
              <span>{totalHours} jam</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            CCC ini akan digunakan untuk menyusun hasil pembelajaran, masa latihan,
            kaedah penyampaian, dan kaedah penilaian bagi setiap Work Step.
          </div>

          <div className="flex items-center justify-between">
            <CCCModeSwitcher mode={mode} onChange={setMode} />
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Tiada data CCP dijumpai. Sila lengkapkan page CCP dahulu sebelum masuk ke CCC.
          </p>
        </div>
      ) : mode === "builder" ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <CCCCard
              key={item.id}
              item={item}
              onChange={handleUpdateItem}
              onGenerateAI={() => handleGenerateAI(item)}
              isGenerating={generatingId === item.id}
            />
          ))}
        </div>
      ) : (
        <CCCDocumentView document={documentData} />
      )}
    </div>
  );
}