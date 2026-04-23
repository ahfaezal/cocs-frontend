"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { CCCItem, DeliveryMethod, AssessmentMethod } from "@/lib/ccc-types";

const DELIVERY_OPTIONS: DeliveryMethod[] = [
  "Lecture",
  "Demonstration",
  "Practical",
  "Discussion",
  "Simulation",
  "Coaching",
];

const ASSESSMENT_OPTIONS: AssessmentMethod[] = [
  "Observation",
  "Oral Questioning",
  "Written Test",
  "Practical Test",
  "Portfolio",
  "Checklist",
];

interface CCCCardProps {
  item: CCCItem;
  onChange: (item: CCCItem) => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export function CCCCard({
  item,
  onChange,
  onGenerateAI,
  isGenerating = false,
}: CCCCardProps) {
  const updateLearningOutcome = (index: number, value: string) => {
    const next = [...item.learningOutcomes];
    next[index] = value;
    onChange({ ...item, learningOutcomes: next });
  };

  const addLearningOutcome = () => {
    onChange({
      ...item,
      learningOutcomes: [...item.learningOutcomes, ""],
    });
  };

  const removeLearningOutcome = (index: number) => {
    if (item.learningOutcomes.length === 1) {
      onChange({
        ...item,
        learningOutcomes: [""],
      });
      return;
    }

    onChange({
      ...item,
      learningOutcomes: item.learningOutcomes.filter((_, i) => i !== index),
    });
  };

  const toggleDeliveryMethod = (method: DeliveryMethod) => {
    const exists = item.deliveryMethods.includes(method);

    if (exists && item.deliveryMethods.length === 1) return;

    const next = exists
      ? item.deliveryMethods.filter((m) => m !== method)
      : [...item.deliveryMethods, method];

    onChange({
      ...item,
      deliveryMethods: next,
    });
  };

  const toggleAssessmentMethod = (method: AssessmentMethod) => {
    const exists = item.assessmentMethods.includes(method);

    if (exists && item.assessmentMethods.length === 1) return;

    const next = exists
      ? item.assessmentMethods.filter((m) => m !== method)
      : [...item.assessmentMethods, method];

    onChange({
      ...item,
      assessmentMethods: next,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {item.competencyTitle}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-800">
              {item.workStepTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{item.cuTitle}</p>
          </div>

          <button
            type="button"
            onClick={onGenerateAI}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles size={16} />
            {isGenerating ? "Generating..." : "AI Generate"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-700">Learning Outcomes</h4>
            <p className="mb-3 text-sm text-slate-500">
              Nyatakan hasil pembelajaran berdasarkan Work Step dan Performance Criteria.
            </p>

            <div className="space-y-3">
              {item.learningOutcomes.map((lo, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-full">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      LO {index + 1}
                    </p>
                    <textarea
                      value={lo}
                      onChange={(e) => updateLearningOutcome(index, e.target.value)}
                      rows={2}
                      className="min-h-[78px] w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder={`Learning Outcome ${index + 1}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLearningOutcome(index)}
                    className="mt-6 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addLearningOutcome}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Plus size={16} />
                Add Learning Outcome
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Training Hours
            </label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={item.trainingHours}
              onChange={(e) => {
                const value = Number(e.target.value);
                onChange({
                  ...item,
                  trainingHours: value,
                });
              }}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (!value || value <= 0) {
                  onChange({
                    ...item,
                    trainingHours: 1,
                  });
                }
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">Delivery Method</h4>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_OPTIONS.map((method) => {
                const active = item.deliveryMethods.includes(method);

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleDeliveryMethod(method)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">Assessment Method</h4>
            <div className="flex flex-wrap gap-2">
              {ASSESSMENT_OPTIONS.map((method) => {
                const active = item.assessmentMethods.includes(method);

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleAssessmentMethod(method)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">
              Linked Performance Criteria
            </h4>

            <div className="space-y-2">
              {item.performanceCriteriaTexts.length > 0 ? (
                item.performanceCriteriaTexts.map((pc, index) => (
                  <div
                    key={`${item.id}-pc-${index}`}
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="mr-2 font-medium text-slate-500">
                      PC {index + 1}.
                    </span>
                    {pc}
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Tiada Performance Criteria
                </div>
              )}
            </div>
          </div>

          {item.aiSuggested &&
          (
            item.aiSuggested.knowledgeItems?.length ||
            item.aiSuggested.attitudeItems?.length ||
            item.aiSuggested.safetyItems?.length ||
            item.aiSuggested.environmentItems?.length
          ) ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <h4 className="mb-3 text-sm font-bold text-emerald-800">
                AI Suggested Content
              </h4>

              <div className="space-y-3 text-sm text-emerald-900">
                {item.aiSuggested.knowledgeItems?.length ? (
                  <div>
                    <p className="mb-1 font-semibold">Knowledge</p>
                    <ul className="ml-5 list-disc space-y-1">
                      {item.aiSuggested.knowledgeItems.map((entry, index) => (
                        <li key={index}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {item.aiSuggested.attitudeItems?.length ? (
                  <div>
                    <p className="mb-1 font-semibold">Attitude</p>
                    <ul className="ml-5 list-disc space-y-1">
                      {item.aiSuggested.attitudeItems.map((entry, index) => (
                        <li key={index}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {item.aiSuggested.safetyItems?.length ? (
                  <div>
                    <p className="mb-1 font-semibold">Safety</p>
                    <ul className="ml-5 list-disc space-y-1">
                      {item.aiSuggested.safetyItems.map((entry, index) => (
                        <li key={index}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {item.aiSuggested.environmentItems?.length ? (
                  <div>
                    <p className="mb-1 font-semibold">Environment</p>
                    <ul className="ml-5 list-disc space-y-1">
                      {item.aiSuggested.environmentItems.map((entry, index) => (
                        <li key={index}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}